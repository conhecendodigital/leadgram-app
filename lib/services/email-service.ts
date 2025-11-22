import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  EmailSettings,
  EmailLog,
  SendEmailParams,
  EmailTemplateType,
  WelcomeEmailData,
  PaymentConfirmationData,
  PaymentFailedData,
  SubscriptionCancelledData,
  AdminNotificationData,
  TestEmailData
} from '@/lib/types/email';

export class EmailService {
  private supabase: SupabaseClient;
  private resend: Resend | null = null;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

  // ============= CONFIGURAÇÕES =============

  async getSettings(): Promise<EmailSettings> {
    const { data, error } = await (this.supabase
      .from('email_settings') as any)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    // Se não existe, criar configuração padrão
    if (!data) {
      const { data: newSettings, error: insertError } = await (this.supabase
        .from('email_settings') as any)
        .insert({
          provider: 'resend',
          from_email: 'noreply@leadgram.app',
          from_name: 'Leadgram',
          enabled: false,
          daily_limit: 1000,
          emails_sent_today: 0,
          send_welcome_email: true,
          send_payment_confirmation: true,
          send_payment_failed: true,
          send_subscription_cancelled: true,
          send_password_reset: true,
          send_admin_notifications: true
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      return newSettings as EmailSettings;
    }

    return data as EmailSettings;
  }

  async updateSettings(settings: Partial<EmailSettings>): Promise<void> {
    const current = await this.getSettings();

    const { error } = await (this.supabase
      .from('email_settings') as any)
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id);

    if (error) throw error;
  }

  private async initializeResend(): Promise<Resend | null> {
    const settings = await this.getSettings();

    if (!settings.enabled || !settings.api_key) {
      return null;
    }

    if (settings.provider !== 'resend') {
      return null;
    }

    if (!this.resend) {
      this.resend = new Resend(settings.api_key);
    }

    return this.resend;
  }

  // ============= ENVIO DE EMAILS =============

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const settings = await this.getSettings();

      // Verificar se está habilitado
      if (!settings.enabled) {
        console.log('📧 Email desabilitado nas configurações');
        return false;
      }

      // Verificar limite diário
      if (settings.emails_sent_today >= settings.daily_limit) {
        console.warn('⚠️ Limite diário de emails atingido');
        return false;
      }

      // Inicializar Resend
      const resend = await this.initializeResend();
      if (!resend) {
        console.error('❌ Resend não configurado');
        return false;
      }

      // Enviar email
      const { data, error } = await resend.emails.send({
        from: `${settings.from_name} <${settings.from_email}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: settings.reply_to
      });

      if (error) {
        console.error('❌ Erro ao enviar email:', error);
        await this.logEmail({
          ...params,
          from_email: settings.from_email,
          status: 'failed',
          error_message: error.message
        });
        return false;
      }

      // Log de sucesso
      await this.logEmail({
        ...params,
        from_email: settings.from_email,
        status: 'sent',
        provider_id: data?.id,
        sent_at: new Date().toISOString()
      });

      // Incrementar contador
      await this.supabase.rpc('increment_email_count');

      console.log('✅ Email enviado:', data?.id);
      return true;

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  private async logEmail(params: SendEmailParams & {
    from_email: string;
    status: 'sent' | 'failed';
    provider_id?: string;
    sent_at?: string;
    error_message?: string;
  }): Promise<void> {
    try {
      await (this.supabase.from('email_logs') as any).insert({
        to_email: params.to,
        from_email: params.from_email,
        subject: params.subject,
        template_type: params.template_type,
        status: params.status,
        provider_id: params.provider_id,
        error_message: params.error_message,
        user_id: params.user_id,
        metadata: params.metadata,
        sent_at: params.sent_at
      });
    } catch (error) {
      console.error('❌ Erro ao logar email:', error);
    }
  }

  // ============= TEMPLATES =============

  async sendWelcomeEmail(email: string, data: WelcomeEmailData): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.send_welcome_email) return false;

    const html = this.generateWelcomeEmailHTML(data);
    const text = this.generateWelcomeEmailText(data);

    return this.sendEmail({
      to: email,
      subject: `Bem-vindo ao Leadgram, ${data.user_name}! 🎉`,
      html,
      text,
      template_type: 'welcome',
      metadata: { user_name: data.user_name, plan_name: data.plan_name }
    });
  }

  async sendPaymentConfirmation(email: string, data: PaymentConfirmationData): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.send_payment_confirmation) return false;

    const html = this.generatePaymentConfirmationHTML(data);
    const text = this.generatePaymentConfirmationText(data);

    return this.sendEmail({
      to: email,
      subject: `Pagamento confirmado - ${data.plan_name}`,
      html,
      text,
      template_type: 'payment_confirmation',
      metadata: {
        plan_name: data.plan_name,
        amount: data.amount,
        payment_id: data.payment_id
      }
    });
  }

  async sendPaymentFailed(email: string, data: PaymentFailedData): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.send_payment_failed) return false;

    const html = this.generatePaymentFailedHTML(data);
    const text = this.generatePaymentFailedText(data);

    return this.sendEmail({
      to: email,
      subject: `Problema com pagamento - ${data.plan_name}`,
      html,
      text,
      template_type: 'payment_failed',
      metadata: {
        plan_name: data.plan_name,
        amount: data.amount,
        error_message: data.error_message
      }
    });
  }

  async sendSubscriptionCancelled(email: string, data: SubscriptionCancelledData): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.send_subscription_cancelled) return false;

    const html = this.generateSubscriptionCancelledHTML(data);
    const text = this.generateSubscriptionCancelledText(data);

    return this.sendEmail({
      to: email,
      subject: `Assinatura cancelada - ${data.plan_name}`,
      html,
      text,
      template_type: 'subscription_cancelled',
      metadata: {
        plan_name: data.plan_name,
        cancelled_at: data.cancelled_at,
        reason: data.reason
      }
    });
  }

  async sendAdminNotification(email: string, data: AdminNotificationData): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.send_admin_notifications) return false;

    const html = this.generateAdminNotificationHTML(data);
    const text = this.generateAdminNotificationText(data);

    return this.sendEmail({
      to: email,
      subject: `[Admin] ${data.title}`,
      html,
      text,
      template_type: 'admin_notification',
      metadata: data.metadata
    });
  }

  async sendTestEmail(email: string, data: TestEmailData): Promise<boolean> {
    const html = this.generateTestEmailHTML(data);
    const text = this.generateTestEmailText(data);

    return this.sendEmail({
      to: email,
      subject: '🧪 Email de Teste - Leadgram',
      html,
      text,
      template_type: 'test_email',
      metadata: { test_message: data.test_message }
    });
  }

  // ============= TEMPLATES HTML =============

  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Leadgram</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🎉 Bem-vindo ao Leadgram!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                Olá, ${data.user_name}!
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
                Estamos muito felizes em ter você conosco! 🚀
              </p>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Sua conta foi criada com sucesso${data.plan_name ? ` no plano <strong>${data.plan_name}</strong>` : ''}.
                Agora você pode começar a explorar ideias de conteúdo e turbinar seu Instagram!
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #1f2937; margin: 0; font-weight: bold;">
                  ✨ Próximos passos:
                </p>
                <ul style="color: #4b5563; margin: 8px 0 0 0; padding-left: 20px;">
                  <li style="margin: 4px 0;">Explore o dashboard</li>
                  <li style="margin: 4px 0;">Conecte sua conta do Instagram</li>
                  <li style="margin: 4px 0;">Gere suas primeiras ideias de conteúdo</li>
                </ul>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Acessar Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Se você tiver alguma dúvida, não hesite em nos contatar. Estamos aqui para ajudar!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Você está recebendo este email porque criou uma conta no Leadgram.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private generateWelcomeEmailText(data: WelcomeEmailData): string {
    return `
Bem-vindo ao Leadgram, ${data.user_name}!

Estamos muito felizes em ter você conosco!

Sua conta foi criada com sucesso${data.plan_name ? ` no plano ${data.plan_name}` : ''}.
Agora você pode começar a explorar ideias de conteúdo e turbinar seu Instagram!

Próximos passos:
- Explore o dashboard
- Conecte sua conta do Instagram
- Gere suas primeiras ideias de conteúdo

Acesse: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Se você tiver alguma dúvida, não hesite em nos contatar.

---
© ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
    `.trim();
  }

  private generatePaymentConfirmationHTML(data: PaymentConfirmationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ✅ Pagamento Confirmado!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                Olá, ${data.user_name}!
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Recebemos seu pagamento com sucesso! Seu plano <strong>${data.plan_name}</strong> já está ativo.
              </p>

              <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #166534; font-weight: bold; padding: 8px 0;">Plano:</td>
                    <td style="color: #166534; text-align: right; padding: 8px 0;">${data.plan_name}</td>
                  </tr>
                  <tr>
                    <td style="color: #166534; font-weight: bold; padding: 8px 0;">Valor:</td>
                    <td style="color: #166534; text-align: right; padding: 8px 0;">R$ ${data.amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="color: #166534; font-weight: bold; padding: 8px 0;">Data:</td>
                    <td style="color: #166534; text-align: right; padding: 8px 0;">${data.payment_date}</td>
                  </tr>
                  <tr>
                    <td style="color: #166534; font-weight: bold; padding: 8px 0; border-top: 1px solid #86efac;">ID:</td>
                    <td style="color: #166534; text-align: right; padding: 8px 0; border-top: 1px solid #86efac; font-family: monospace; font-size: 12px;">${data.payment_id}</td>
                  </tr>
                </table>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Acessar Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Obrigado por escolher o Leadgram! 🚀
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private generatePaymentConfirmationText(data: PaymentConfirmationData): string {
    return `
Pagamento Confirmado!

Olá, ${data.user_name}!

Recebemos seu pagamento com sucesso! Seu plano ${data.plan_name} já está ativo.

Detalhes do pagamento:
- Plano: ${data.plan_name}
- Valor: R$ ${data.amount.toFixed(2)}
- Data: ${data.payment_date}
- ID: ${data.payment_id}

Acesse: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Obrigado por escolher o Leadgram!

---
© ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
    `.trim();
  }

  private generatePaymentFailedHTML(data: PaymentFailedData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Problema com Pagamento</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ⚠️ Problema com Pagamento
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                Olá, ${data.user_name}
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
                Identificamos um problema ao processar seu pagamento para o plano <strong>${data.plan_name}</strong>.
              </p>

              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #991b1b; margin: 0; font-weight: bold;">Motivo:</p>
                <p style="color: #7f1d1d; margin: 8px 0 0 0;">${data.error_message}</p>
              </div>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                <strong>O que fazer?</strong>
              </p>

              <ul style="color: #4b5563; margin: 0 0 24px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Verifique os dados do seu cartão</li>
                <li style="margin: 8px 0;">Confira se há saldo disponível</li>
                <li style="margin: 8px 0;">Tente novamente em alguns instantes</li>
              </ul>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=plans"
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Tentar Novamente
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Se o problema persistir, entre em contato com nosso suporte.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private generatePaymentFailedText(data: PaymentFailedData): string {
    return `
Problema com Pagamento

Olá, ${data.user_name}

Identificamos um problema ao processar seu pagamento para o plano ${data.plan_name}.

Motivo: ${data.error_message}

O que fazer?
- Verifique os dados do seu cartão
- Confira se há saldo disponível
- Tente novamente em alguns instantes

Acesse: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=plans

Se o problema persistir, entre em contato com nosso suporte.

---
© ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
    `.trim();
  }

  private generateSubscriptionCancelledHTML(data: SubscriptionCancelledData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assinatura Cancelada</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Assinatura Cancelada
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                Olá, ${data.user_name}
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Confirmamos o cancelamento da sua assinatura do plano <strong>${data.plan_name}</strong>.
              </p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #374151; margin: 0;"><strong>Data do cancelamento:</strong> ${data.cancelled_at}</p>
                ${data.reason ? `<p style="color: #374151; margin: 8px 0 0 0;"><strong>Motivo:</strong> ${data.reason}</p>` : ''}
              </div>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Sentiremos sua falta! Se você mudar de ideia, ficaremos felizes em recebê-lo de volta.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=plans"
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Ver Planos
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private generateSubscriptionCancelledText(data: SubscriptionCancelledData): string {
    return `
Assinatura Cancelada

Olá, ${data.user_name}

Confirmamos o cancelamento da sua assinatura do plano ${data.plan_name}.

Data do cancelamento: ${data.cancelled_at}
${data.reason ? `Motivo: ${data.reason}` : ''}

Sentiremos sua falta! Se você mudar de ideia, ficaremos felizes em recebê-lo de volta.

Ver Planos: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=plans

---
© ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
    `.trim();
  }

  private generateAdminNotificationHTML(data: AdminNotificationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificação Admin</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🔔 ${data.title}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                ${data.message}
              </div>

              ${data.link ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="${data.link}"
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Ver Detalhes
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Leadgram. Notificação automática do sistema.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private generateAdminNotificationText(data: AdminNotificationData): string {
    return `
${data.title}

${data.message}

${data.link ? `Ver Detalhes: ${data.link}` : ''}

---
© ${new Date().getFullYear()} Leadgram. Notificação automática do sistema.
    `.trim();
  }

  private generateTestEmailHTML(data: TestEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email de Teste</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🧪 Email de Teste
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                Teste bem-sucedido! ✅
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                ${data.test_message}
              </p>

              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #78350f; margin: 0; font-weight: bold;">
                  ⚡ Seu sistema de emails está funcionando perfeitamente!
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Data e hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Leadgram. Email de teste do sistema.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private generateTestEmailText(data: TestEmailData): string {
    return `
Email de Teste

Teste bem-sucedido! ✅

${data.test_message}

Seu sistema de emails está funcionando perfeitamente!

Data e hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}

---
© ${new Date().getFullYear()} Leadgram. Email de teste do sistema.
    `.trim();
  }

  // ============= OTP (ONE-TIME PASSWORD) EMAILS =============

  /**
   * Envia email simples (servidor ou desenvolvimento)
   */
  private static async sendSimpleEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    // Tentar enviar via Resend se configurado
    console.log('📧 Tentando enviar email para:', to)
    console.log('🔑 RESEND_API_KEY configurado:', !!process.env.RESEND_API_KEY)

    if (process.env.RESEND_API_KEY) {
      try {
        console.log('📤 Enviando via Resend API...')
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Leadgram <noreply@formulareal.online>',
            to: [to],
            subject,
            html,
            text,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          console.error('❌ Erro ao enviar email via Resend (HTTP', response.status, '):', error)
          throw new Error(`Falha ao enviar email: ${error}`)
        }

        const result = await response.json()
        console.log('✅ Email enviado com sucesso via Resend:', result)
        return
      } catch (error) {
        console.error('❌ Erro ao enviar via Resend:', error)
        throw error
      }
    }

    // Modo desenvolvimento: apenas loga o código no console
    console.warn('⚠️ RESEND_API_KEY não configurado - email NÃO foi enviado!')
    console.log('📧 [DESENVOLVIMENTO] Email OTP:', {
      to,
      subject,
      text: text.substring(0, 200)
    })
    throw new Error('RESEND_API_KEY não configurado. Configure a variável de ambiente para enviar emails.')
  }

  /**
   * Envia email com código OTP de 6 dígitos para verificação de email
   */
  static async sendEmailVerificationOTP(email: string, code: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ✉️ Confirme seu email
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                Bem-vindo ao Leadgram!
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Use o código abaixo para confirmar seu endereço de email:
              </p>

              <!-- Código OTP -->
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px dashed #3b82f6; border-radius: 12px; padding: 24px; margin: 0 0 24px 0; text-align: center;">
                <div style="font-size: 42px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>

              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #1e40af; margin: 0; font-size: 14px;">
                  <strong>⏱️ Este código expira em 15 minutos</strong>
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Se você não criou uma conta no Leadgram, ignore este email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const text = `
Confirme seu email - Leadgram

Bem-vindo ao Leadgram!

Use o código abaixo para confirmar seu endereço de email:

CÓDIGO: ${code}

⏱️ Este código expira em 15 minutos

Se você não criou uma conta no Leadgram, ignore este email.

---
© ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
    `.trim();

    // Enviar email
    await this.sendSimpleEmail(
      email,
      'Confirme seu email - Leadgram',
      html,
      text
    );
  }

  /**
   * Envia email com código OTP de 6 dígitos para reset de senha
   */
  static async sendPasswordResetOTP(email: string, code: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🔒 Redefinir senha
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                Recuperação de senha
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Você solicitou a redefinição de senha. Use o código abaixo:
              </p>

              <!-- Código OTP -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px dashed #dc2626; border-radius: 12px; padding: 24px; margin: 0 0 24px 0; text-align: center;">
                <div style="font-size: 42px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>

              <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; border-radius: 4px; padding: 16px; margin: 0 0 24px 0;">
                <p style="color: #991b1b; margin: 0; font-size: 14px;">
                  <strong>⏱️ Este código expira em 60 minutos</strong>
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Se você não solicitou esta recuperação, ignore este email e sua conta permanecerá segura.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const text = `
Redefinir senha - Leadgram

Recuperação de senha

Você solicitou a redefinição de senha. Use o código abaixo:

CÓDIGO: ${code}

⏱️ Este código expira em 60 minutos

Se você não solicitou esta recuperação, ignore este email e sua conta permanecerá segura.

---
© ${new Date().getFullYear()} Leadgram. Todos os direitos reservados.
    `.trim();

    // Enviar email
    await this.sendSimpleEmail(
      email,
      'Redefinir senha - Leadgram',
      html,
      text
    );
  }

  // ============= LOGS =============

  async getLogs(limit = 50): Promise<EmailLog[]> {
    const { data, error } = await (this.supabase
      .from('email_logs') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as EmailLog[];
  }

  async getLogsByUser(userId: string, limit = 50): Promise<EmailLog[]> {
    const { data, error } = await (this.supabase
      .from('email_logs') as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as EmailLog[];
  }

  async getStats(): Promise<{
    total: number;
    sent: number;
    failed: number;
    today: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [totalResult, sentResult, failedResult, todayResult] = await Promise.all([
      (this.supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }),
      (this.supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      (this.supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      (this.supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }).gte('created_at', today)
    ]);

    return {
      total: totalResult.count || 0,
      sent: sentResult.count || 0,
      failed: failedResult.count || 0,
      today: todayResult.count || 0
    };
  }
}

// Lazy-loaded singleton for client-side usage
let _emailServiceInstance: EmailService | null = null;
export const emailService = {
  get instance() {
    if (!_emailServiceInstance) {
      _emailServiceInstance = new EmailService();
    }
    return _emailServiceInstance;
  }
};
