import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Webhook,
  WebhookLog,
  WebhookEvent,
  WebhookPayload,
  WebhookTestResult,
  WebhookStats
} from '@/lib/types/webhook';

export class WebhookService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

  // ============= CRUD DE WEBHOOKS =============

  async getWebhooks(): Promise<Webhook[]> {
    const { data, error } = await (this.supabase
      .from('webhooks') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Webhook[];
  }

  async getWebhook(id: string): Promise<Webhook | null> {
    const { data, error } = await (this.supabase
      .from('webhooks') as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Webhook | null;
  }

  async createWebhook(webhook: Omit<Webhook, 'id' | 'created_at' | 'updated_at' | 'total_calls' | 'success_calls' | 'failed_calls'>): Promise<Webhook> {
    const user = (await this.supabase.auth.getUser()).data.user;

    const { data, error } = await (this.supabase
      .from('webhooks') as any)
      .insert({
        ...webhook,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Webhook;
  }

  async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook> {
    const { data, error } = await (this.supabase
      .from('webhooks') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Webhook;
  }

  async deleteWebhook(id: string): Promise<void> {
    const { error } = await (this.supabase
      .from('webhooks') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async toggleWebhook(id: string, enabled: boolean): Promise<void> {
    await this.updateWebhook(id, { enabled });
  }

  // ============= ENVIO DE WEBHOOKS =============

  async triggerWebhook(webhookId: string, event: WebhookEvent, data: Record<string, any>): Promise<boolean> {
    const webhook = await this.getWebhook(webhookId);

    if (!webhook || !webhook.enabled) {
      console.log(`⚠️  Webhook ${webhookId} desabilitado ou não encontrado`);
      return false;
    }

    // Verificar se o webhook escuta este evento
    if (!webhook.events.includes(event) && !webhook.events.includes('custom')) {
      console.log(`⚠️  Webhook ${webhookId} não escuta evento ${event}`);
      return false;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        webhook_id: webhookId,
        webhook_name: webhook.name
      }
    };

    return await this.sendWebhook(webhook, payload);
  }

  private async sendWebhook(webhook: Webhook, payload: WebhookPayload, attempt = 1): Promise<boolean> {
    const startTime = Date.now();

    // Criar log inicial
    const { data: logData } = await (this.supabase
      .from('webhook_logs') as any)
      .insert({
        webhook_id: webhook.id,
        event: payload.event,
        payload: payload,
        status: 'pending',
        attempt
      })
      .select()
      .single();

    try {
      // Preparar headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Leadgram-Webhook/1.0',
        ...webhook.custom_headers
      };

      // Adicionar secret se configurado
      if (webhook.secret) {
        headers['X-Webhook-Secret'] = webhook.secret;
        headers['X-Webhook-Signature'] = this.generateSignature(payload, webhook.secret);
      }

      // Enviar requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout * 1000);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      const responseBody = await response.text();

      // Atualizar log
      await (this.supabase
        .from('webhook_logs') as any)
        .update({
          status: response.ok ? 'success' : 'failed',
          http_status: response.status,
          response_body: responseBody.substring(0, 1000), // Limitar tamanho
          duration_ms: duration,
          completed_at: new Date().toISOString()
        })
        .eq('id', logData.id);

      // Atualizar estatísticas
      await this.supabase.rpc('update_webhook_stats', {
        webhook_uuid: webhook.id,
        success: response.ok,
        error_msg: response.ok ? null : `HTTP ${response.status}: ${responseBody.substring(0, 200)}`
      });

      if (!response.ok && attempt < webhook.max_retries) {
        // Retry após delay
        console.log(`⚠️  Webhook ${webhook.name} falhou (tentativa ${attempt}/${webhook.max_retries}). Tentando novamente em ${webhook.retry_delay}s...`);

        await new Promise(resolve => setTimeout(resolve, webhook.retry_delay * 1000));
        return await this.sendWebhook(webhook, payload, attempt + 1);
      }

      return response.ok;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || 'Erro desconhecido';

      // Atualizar log com erro
      await (this.supabase
        .from('webhook_logs') as any)
        .update({
          status: attempt >= webhook.max_retries ? 'failed' : 'retrying',
          error_message: errorMessage,
          duration_ms: duration,
          completed_at: new Date().toISOString()
        })
        .eq('id', logData.id);

      // Atualizar estatísticas
      await this.supabase.rpc('update_webhook_stats', {
        webhook_uuid: webhook.id,
        success: false,
        error_msg: errorMessage
      });

      if (attempt < webhook.max_retries) {
        console.log(`⚠️  Webhook ${webhook.name} erro (tentativa ${attempt}/${webhook.max_retries}). Tentando novamente em ${webhook.retry_delay}s...`);

        await new Promise(resolve => setTimeout(resolve, webhook.retry_delay * 1000));
        return await this.sendWebhook(webhook, payload, attempt + 1);
      }

      console.error(`❌ Webhook ${webhook.name} falhou após ${attempt} tentativas:`, error);
      return false;
    }
  }

  private generateSignature(payload: WebhookPayload, secret: string): string {
    // Implementação simples de assinatura
    // Em produção, usar HMAC SHA256
    const data = JSON.stringify(payload);
    return Buffer.from(`${secret}:${data}`).toString('base64').substring(0, 64);
  }

  // ============= TESTE DE WEBHOOK =============

  async testWebhook(id: string): Promise<WebhookTestResult> {
    const webhook = await this.getWebhook(id);

    if (!webhook) {
      return {
        success: false,
        error: 'Webhook não encontrado'
      };
    }

    const testPayload: WebhookPayload = {
      event: 'custom',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'Este é um teste de webhook do Leadgram'
      },
      metadata: {
        test: true
      }
    };

    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Leadgram-Webhook/1.0 (Test)',
        ...webhook.custom_headers
      };

      if (webhook.secret) {
        headers['X-Webhook-Secret'] = webhook.secret;
        headers['X-Webhook-Signature'] = this.generateSignature(testPayload, webhook.secret);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout * 1000);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      return {
        success: response.ok,
        status_code: response.status,
        response_time_ms: duration,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        response_time_ms: duration,
        error: error.message || 'Erro ao enviar requisição'
      };
    }
  }

  // ============= LOGS =============

  async getLogs(webhookId?: string, limit = 50): Promise<WebhookLog[]> {
    let query = (this.supabase
      .from('webhook_logs') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (webhookId) {
      query = query.eq('webhook_id', webhookId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as WebhookLog[];
  }

  async getLogsByEvent(event: WebhookEvent, limit = 50): Promise<WebhookLog[]> {
    const { data, error } = await (this.supabase
      .from('webhook_logs') as any)
      .select('*')
      .eq('event', event)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as WebhookLog[];
  }

  async cleanupOldLogs(): Promise<number> {
    try {
      const { data, error } = await (this.supabase.rpc as any)(
        'cleanup_old_webhook_logs'
      );

      if (error) throw error;
      return (data as number) || 0;
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      return 0;
    }
  }

  // ============= ESTATÍSTICAS =============

  async getStats(): Promise<WebhookStats> {
    const [webhooks, logsToday] = await Promise.all([
      this.getWebhooks(),
      this.getLogsToday()
    ]);

    const active = webhooks.filter(w => w.enabled && w.status === 'active').length;
    const inactive = webhooks.filter(w => !w.enabled || w.status !== 'active').length;

    const totalCalls = logsToday.length;
    const successCalls = logsToday.filter(l => l.status === 'success').length;
    const successRate = totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0;

    const responseTimes = logsToday
      .filter(l => l.duration_ms !== null && l.duration_ms !== undefined)
      .map(l => l.duration_ms!);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    return {
      total_webhooks: webhooks.length,
      active_webhooks: active,
      inactive_webhooks: inactive,
      total_calls_today: totalCalls,
      success_rate: Math.round(successRate),
      average_response_time: Math.round(avgResponseTime)
    };
  }

  private async getLogsToday(): Promise<WebhookLog[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await (this.supabase
      .from('webhook_logs') as any)
      .select('*')
      .gte('created_at', today);

    if (error) throw error;
    return data as WebhookLog[];
  }

  // ============= UTILITÁRIOS =============

  getAvailableEvents(): WebhookEvent[] {
    return [
      'user.created',
      'user.updated',
      'user.deleted',
      'payment.created',
      'payment.approved',
      'payment.failed',
      'subscription.created',
      'subscription.cancelled',
      'idea.created',
      'idea.updated',
      'custom'
    ];
  }
}

// Lazy-loaded singleton for client-side usage
let _webhookServiceInstance: WebhookService | null = null;
export const webhookService = {
  get instance() {
    if (!_webhookServiceInstance) {
      _webhookServiceInstance = new WebhookService();
    }
    return _webhookServiceInstance;
  }
};
