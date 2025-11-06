export type NotificationType = 'new_user' | 'payment' | 'cancellation' | 'system_error';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  user_id?: string;
  link?: string;
}

export interface NotificationSettings {
  notify_new_users: boolean;
  notify_payments: boolean;
  notify_cancellations: boolean;
  notify_system_errors: boolean;
  email_on_errors: boolean;
  admin_email?: string;
}
