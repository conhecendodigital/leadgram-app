// =============================================
// EMAIL TYPES
// =============================================

export type EmailProvider = 'resend' | 'smtp' | 'sendgrid' | 'mailgun' | 'ses';

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced';

export type EmailTemplateType =
  | 'welcome'
  | 'payment_confirmation'
  | 'payment_failed'
  | 'subscription_cancelled'
  | 'password_reset'
  | 'admin_notification'
  | 'new_user_notification'
  | 'test_email';

export interface EmailSettings {
  id: string;

  // Provider settings
  provider: EmailProvider;
  api_key?: string;

  // Sender settings
  from_email: string;
  from_name: string;
  reply_to?: string;

  // SMTP settings (if provider = 'smtp')
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  smtp_secure?: boolean;

  // Sending settings
  enabled: boolean;
  daily_limit: number;
  emails_sent_today: number;
  last_reset_date: string;

  // Template toggles
  send_welcome_email: boolean;
  send_payment_confirmation: boolean;
  send_payment_failed: boolean;
  send_subscription_cancelled: boolean;
  send_password_reset: boolean;
  send_admin_notifications: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface EmailLog {
  id: string;

  // Email info
  to_email: string;
  from_email: string;
  subject: string;
  template_type?: EmailTemplateType;

  // Status
  status: EmailStatus;
  provider_id?: string;
  error_message?: string;

  // Metadata
  user_id?: string;
  metadata?: Record<string, any>;
  sent_at?: string;
  created_at: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  template_type?: EmailTemplateType;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface WelcomeEmailData {
  user_name: string;
  user_email: string;
  plan_name?: string;
}

export interface PaymentConfirmationData {
  user_name: string;
  plan_name: string;
  amount: number;
  payment_date: string;
  payment_id: string;
}

export interface PaymentFailedData {
  user_name: string;
  plan_name: string;
  amount: number;
  error_message: string;
}

export interface SubscriptionCancelledData {
  user_name: string;
  plan_name: string;
  cancelled_at: string;
  reason?: string;
}

export interface AdminNotificationData {
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface TestEmailData {
  test_message: string;
}
