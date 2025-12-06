import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminNotification, NotificationType, NotificationSettings } from '@/lib/types/notifications';
import { EmailService } from './email-service';

export class NotificationService {
  private supabase: SupabaseClient;
  private emailService: EmailService;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
    this.emailService = new EmailService(this.supabase);
  }

  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
    userId?: string,
    link?: string
  ) {
    const { data, error } = await (this.supabase
      .from('admin_notifications') as any)
      .insert({
        type,
        title,
        message,
        metadata,
        user_id: userId,
        link
      })
      .select()
      .single();

    if (error) throw error;

    // Verificar se deve enviar email
    await this.checkAndSendEmail(type, title, message, link);

    return data;
  }

  async getNotifications(limit = 10, unreadOnly = false) {
    let query = (this.supabase
      .from('admin_notifications') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AdminNotification[];
  }

  async markAsRead(id: string) {
    const { error } = await (this.supabase
      .from('admin_notifications') as any)
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async markAllAsRead() {
    const { error } = await (this.supabase
      .from('admin_notifications') as any)
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  }

  async getUnreadCount() {
    const { count, error } = await (this.supabase
      .from('admin_notifications') as any)
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  private async checkAndSendEmail(
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) {
    try {
      const { data: settings } = await (this.supabase
        .from('admin_notification_settings') as any)
        .select('*')
        .maybeSingle();

      if (!settings?.admin_email) return;

      // Verificar se deve enviar email baseado no tipo de notificação
      const shouldSendEmail =
        (type === 'system_error' && settings.email_on_errors) ||
        (type === 'payment' && settings.notify_payments) ||
        (type === 'cancellation' && settings.notify_cancellations) ||
        (type === 'new_user' && settings.notify_new_users);

      if (!shouldSendEmail) return;

      // Enviar email usando o EmailService
      await this.emailService.sendAdminNotification(settings.admin_email, {
        title,
        message,
        link: link ? `${process.env.NEXT_PUBLIC_APP_URL}${link}` : undefined,
        metadata: { type }
      });

      console.log(`📧 Email de notificação enviado para ${settings.admin_email} (${type})`);
    } catch (error) {
      // Não propagar erro para não interromper a criação da notificação
      console.error('❌ Erro ao enviar email de notificação:', error);
    }
  }

  async getSettings(): Promise<NotificationSettings | null> {
    const { data, error } = await (this.supabase
      .from('admin_notification_settings') as any)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    // Se não existe, criar configuração padrão
    if (!data) {
      const { data: newSettings, error: insertError } = await (this.supabase
        .from('admin_notification_settings') as any)
        .insert({
          notify_new_users: true,
          notify_payments: true,
          notify_cancellations: true,
          notify_system_errors: true,
          email_on_errors: true,
          admin_email: ''
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      return newSettings as NotificationSettings | null;
    }

    return data as NotificationSettings | null;
  }

  async updateSettings(settings: Partial<NotificationSettings>) {
    const { data: currentSettings } = await (this.supabase
      .from('admin_notification_settings') as any)
      .select('id')
      .maybeSingle();

    if (!currentSettings) {
      // Se não existe, criar primeiro
      await this.getSettings();
      // Tentar novamente
      const { data: retrySettings } = await (this.supabase
        .from('admin_notification_settings') as any)
        .select('id')
        .maybeSingle();

      if (!retrySettings) throw new Error('Failed to create settings');

      const { error } = await (this.supabase
        .from('admin_notification_settings') as any)
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', retrySettings.id);

      if (error) throw error;
      return;
    }

    const { error } = await (this.supabase
      .from('admin_notification_settings') as any)
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', currentSettings.id);

    if (error) throw error;
  }

  // ============= MÉTODOS CONVENIENTES =============
  // Estes métodos facilitam a criação de notificações programaticamente
  // Nota: Os triggers do banco também criam notificações automaticamente

  /**
   * Criar notificação de novo usuário
   * Nota: Normalmente isso é feito via trigger no banco
   */
  async notifyNewUser(userId: string, userEmail: string) {
    return this.createNotification(
      'new_user',
      'Novo Usuário Registrado',
      `${userEmail} acabou de se registrar`,
      { email: userEmail },
      userId,
      '/admin/clientes'
    );
  }

  /**
   * Criar notificação de pagamento
   * Nota: Normalmente isso é feito via trigger no banco
   */
  async notifyPayment(userId: string, amount: number, planName?: string) {
    return this.createNotification(
      'payment',
      'Novo Pagamento',
      `Recebido R$ ${amount.toFixed(2)}${planName ? ` do plano ${planName}` : ''}`,
      { amount, plan: planName },
      userId,
      '/admin/pagamentos'
    );
  }

  /**
   * Criar notificação de cancelamento
   * Nota: Normalmente isso é feito via trigger no banco
   */
  async notifyCancellation(userId: string, planName: string) {
    return this.createNotification(
      'cancellation',
      'Assinatura Cancelada',
      `Usuário cancelou assinatura do plano ${planName}`,
      { plan: planName },
      userId,
      '/admin/clientes'
    );
  }

  /**
   * Criar notificação de erro do sistema
   * Nota: Normalmente isso é feito via trigger no banco
   */
  async notifyError(errorMessage: string, errorType: string, metadata?: Record<string, any>) {
    return this.createNotification(
      'system_error',
      'Erro Crítico do Sistema',
      errorMessage.substring(0, 200),
      { error_type: errorType, ...metadata },
      undefined,
      '/admin/logs'
    );
  }
}

// Lazy-loaded singleton for client-side usage
let _notificationServiceInstance: NotificationService | null = null;
export const notificationService = {
  get instance() {
    if (!_notificationServiceInstance) {
      _notificationServiceInstance = new NotificationService();
    }
    return _notificationServiceInstance;
  }
};
