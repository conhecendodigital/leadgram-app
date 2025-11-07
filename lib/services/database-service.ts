import { createClient } from '@/lib/supabase/client';
import type { DatabaseStats, CleanupStats } from '@/lib/types/database';

export class DatabaseService {
  private supabase = createClient();

  // ============= ESTATÍSTICAS =============
  async getStats(): Promise<DatabaseStats> {
    try {
      const [usersCount, ideasCount, notifsCount] = await Promise.all([
        (this.supabase.from('profiles') as any).select('*', { count: 'exact', head: true }),
        (this.supabase.from('ideas') as any).select('*', { count: 'exact', head: true }),
        (this.supabase.from('admin_notifications') as any).select('*', { count: 'exact', head: true })
      ]);

      // Calcular tamanho aproximado (Supabase não expõe isso facilmente)
      const estimatedSize = (
        (usersCount.count || 0) * 5 + // ~5KB por usuário
        (ideasCount.count || 0) * 10 + // ~10KB por ideia
        (notifsCount.count || 0) * 2 // ~2KB por notificação
      ) / 1024; // Converter para MB

      return {
        totalUsers: usersCount.count || 0,
        totalIdeas: ideasCount.count || 0,
        totalNotifications: notifsCount.count || 0,
        databaseSize: `${estimatedSize.toFixed(1)} MB`,
        spaceUsed: Math.min((estimatedSize / 1024) * 100, 100) // % de 1GB
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // ============= LIMPEZA =============
  async getCleanupStats(): Promise<CleanupStats> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [oldNotifs] = await Promise.all([
      (this.supabase
        .from('admin_notifications') as any)
        .select('*', { count: 'exact', head: true })
        .lt('created_at', ninetyDaysAgo.toISOString())
    ]);

    return {
      oldNotifications: oldNotifs.count || 0,
      oldLogs: 0, // TODO: implementar quando tiver tabela de logs
      expiredSessions: 0, // Gerenciado pelo Supabase
      oldCache: 0 // TODO: implementar se necessário
    };
  }

  async cleanupOldData(type: 'notifications' | 'logs' | 'sessions' | 'cache'): Promise<number> {
    if (type === 'notifications') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data, error } = await (this.supabase
        .from('admin_notifications') as any)
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString())
        .select();

      if (error) throw error;

      // Criar notificação de limpeza
      await (this.supabase.from('admin_notifications') as any).insert({
        type: 'system_error',
        title: 'Limpeza Realizada',
        message: `${data?.length || 0} notificações antigas foram removidas`
      });

      return data?.length || 0;
    }

    return 0;
  }
}

export const databaseService = new DatabaseService();
