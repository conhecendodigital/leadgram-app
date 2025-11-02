import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  type: 'content_idea' | 'goal_achievement' | 'instagram_sync' | 'system_update'
  title: string
  message: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = createClient()

  const { data, error } = await (supabase
    .from('notifications') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data as Notification[]
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()

  const { count, error } = await (supabase
    .from('notifications') as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await (supabase
    .from('notifications') as any)
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    return false
  }

  return true
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await (supabase
    .from('notifications') as any)
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }

  return true
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await (supabase
    .from('notifications') as any)
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    return false
  }

  return true
}

export function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'content_idea':
      return '💡'
    case 'goal_achievement':
      return '🎯'
    case 'instagram_sync':
      return '🔄'
    case 'system_update':
      return '🔔'
    default:
      return '📬'
  }
}

export function getNotificationColor(type: Notification['type']): string {
  switch (type) {
    case 'content_idea':
      return 'from-yellow-500 to-orange-500'
    case 'goal_achievement':
      return 'from-green-500 to-emerald-500'
    case 'instagram_sync':
      return 'from-blue-500 to-cyan-500'
    case 'system_update':
      return 'from-purple-500 to-pink-500'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

// Função auxiliar para criar notificações inteligentes baseadas em ideias
export async function createSmartNotifications(userId: string): Promise<void> {
  const supabase = createClient()

  try {
    // 1. Buscar ideias para gravar
    const { data: ideasToRecord, error: ideasError } = await (supabase
      .from('ideas') as any)
      .select('id, title, created_at')
      .eq('user_id', userId)
      .eq('status', 'idea')
      .order('created_at', { ascending: true })
      .limit(10)

    if (!ideasError && ideasToRecord && ideasToRecord.length > 0) {
      // Verificar se já existe notificação similar recente
      const { data: existingNotif } = await (supabase
        .from('notifications') as any)
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'content_idea')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (!existingNotif) {
        await (supabase
          .from('notifications') as any)
          .insert({
            user_id: userId,
            type: 'content_idea',
            title: `${ideasToRecord.length} ${ideasToRecord.length === 1 ? 'ideia aguardando' : 'ideias aguardando'} gravação`,
            message: 'Você tem conteúdos prontos para produzir',
            read: false,
            created_at: new Date().toISOString(),
            metadata: { count: ideasToRecord.length }
          })
      }
    }

    // 2. Buscar ideias gravadas mas não postadas
    const { data: recordedIdeas, error: recordedError } = await (supabase
      .from('ideas') as any)
      .select('id, title')
      .eq('user_id', userId)
      .eq('status', 'recorded')
      .limit(5)

    if (!recordedError && recordedIdeas && recordedIdeas.length > 0) {
      const { data: existingNotif } = await (supabase
        .from('notifications') as any)
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'content_idea')
        .ilike('title', '%vídeo%pronto%')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (!existingNotif) {
        await (supabase
          .from('notifications') as any)
          .insert({
            user_id: userId,
            type: 'content_idea',
            title: `${recordedIdeas.length} ${recordedIdeas.length === 1 ? 'vídeo pronto' : 'vídeos prontos'} para postar`,
            message: 'Conteúdos gravados aguardando publicação',
            read: false,
            created_at: new Date().toISOString(),
            metadata: { count: recordedIdeas.length }
          })
      }
    }
  } catch (error) {
    console.error('Error creating smart notifications:', error)
  }
}
