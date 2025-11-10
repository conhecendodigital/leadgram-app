// =============================================
// WEBHOOK TYPES
// =============================================

export type WebhookEvent =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'payment.created'
  | 'payment.approved'
  | 'payment.failed'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'idea.created'
  | 'idea.updated'
  | 'custom';

export type WebhookStatus = 'active' | 'inactive' | 'error';

export type WebhookLogStatus = 'pending' | 'success' | 'failed' | 'retrying';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  description?: string;

  // Eventos
  events: WebhookEvent[];

  // Configurações
  secret?: string;
  enabled: boolean;
  status: WebhookStatus;

  // Retry settings
  max_retries: number;
  retry_delay: number; // segundos
  timeout: number; // segundos

  // Headers customizados
  custom_headers?: Record<string, string>;

  // Estatísticas
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  last_called_at?: string;
  last_success_at?: string;
  last_error?: string;

  // Metadados
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;

  // Request
  event: WebhookEvent;
  payload: Record<string, any>;

  // Response
  status: WebhookLogStatus;
  http_status?: number;
  response_body?: string;
  error_message?: string;

  // Timing
  attempt: number;
  duration_ms?: number;

  // Metadados
  created_at: string;
  completed_at?: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WebhookTestResult {
  success: boolean;
  status_code?: number;
  response_time_ms?: number;
  error?: string;
}

export interface WebhookStats {
  total_webhooks: number;
  active_webhooks: number;
  inactive_webhooks: number;
  total_calls_today: number;
  success_rate: number;
  average_response_time: number;
}
