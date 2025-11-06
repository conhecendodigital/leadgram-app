import { createClient } from '@/lib/supabase/client';
import type { AdminNotification, NotificationType, NotificationSettings } from '@/lib/types/notifications';

export class NotificationService {
  private supabase = createClient();

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
    await this.checkAndSendEmail(type, title, message);

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
    message: string
  ) {
    const { data: settings } = await (this.supabase
      .from('admin_notification_settings') as any)
      .select('*')
      .single();

    if (!settings?.email_on_errors || type !== 'system_error') return;
    if (!settings.admin_email) return;

    // TODO: Implementar envio de email
    // await sendEmail(settings.admin_email, title, message);
  }

  async getSettings(): Promise<NotificationSettings | null> {
    const { data, error } = await (this.supabase
      .from('admin_notification_settings') as any)
      .select('*')
      .single();

    if (error) throw error;
    return data as NotificationSettings | null;
  }

  async updateSettings(settings: Partial<NotificationSettings>) {
    const { data: currentSettings } = await (this.supabase
      .from('admin_notification_settings') as any)
      .select('id')
      .single();

    if (!currentSettings) throw new Error('Settings not found');

    const { error } = await (this.supabase
      .from('admin_notification_settings') as any)
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', currentSettings.id);

    if (error) throw error;
  }
}

export const notificationService = new NotificationService();
