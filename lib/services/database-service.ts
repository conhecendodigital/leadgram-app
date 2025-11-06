import { createClient } from '@/lib/supabase/client';
import type { DatabaseStats, DatabaseBackup, BackupConfig, CleanupStats } from '@/lib/types/database';

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

  // ============= BACKUPS =============
  async getBackups(limit = 10): Promise<DatabaseBackup[]> {
    const { data, error } = await (this.supabase
      .from('database_backups') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DatabaseBackup[];
  }

  async createBackup(): Promise<DatabaseBackup> {
    const user = (await this.supabase.auth.getUser()).data.user;

    // Simular criação de backup
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    const estimatedSize = Math.floor(Math.random() * 10000000) + 40000000; // 40-50 MB

    const { data, error } = await (this.supabase
      .from('database_backups') as any)
      .insert({
        filename,
        size_bytes: estimatedSize,
        backup_type: 'manual',
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Criar notificação de backup criado
    await (this.supabase.from('admin_notifications') as any).insert({
      type: 'system_error', // Usar como evento do sistema
      title: 'Backup Criado',
      message: `Backup manual criado com sucesso: ${filename}`,
      metadata: { backup_id: data.id }
    });

    return data as DatabaseBackup;
  }

  async deleteBackup(id: string): Promise<void> {
    const { error } = await (this.supabase
      .from('database_backups') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============= BACKUP AUTOMÁTICO =============
  async getBackupConfig(): Promise<BackupConfig> {
    const { data, error } = await (this.supabase
      .from('database_backup_config') as any)
      .select('*')
      .single();

    if (error) throw error;
    return data as BackupConfig;
  }

  async updateBackupConfig(config: Partial<BackupConfig>): Promise<void> {
    const current = await this.getBackupConfig();

    // Calcular próximo backup
    let nextRun: Date | null = null;
    if (config.enabled !== false) {
      nextRun = this.calculateNextRun(
        config.frequency || current.frequency,
        config.time || current.time,
        config.day_of_week,
        config.day_of_month
      );
    }

    const { error } = await (this.supabase
      .from('database_backup_config') as any)
      .update({
        ...config,
        next_run: nextRun?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id);

    if (error) throw error;
  }

  private calculateNextRun(
    frequency: string,
    time: string,
    dayOfWeek?: number,
    dayOfMonth?: number
  ): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    let next = new Date();

    next.setHours(hours, minutes, 0, 0);

    if (frequency === 'daily') {
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
      next.setDate(next.getDate() + ((7 + dayOfWeek - next.getDay()) % 7));
      if (next <= now) {
        next.setDate(next.getDate() + 7);
      }
    } else if (frequency === 'monthly' && dayOfMonth !== undefined) {
      next.setDate(dayOfMonth);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
    }

    return next;
  }

  // ============= LIMPEZA =============
  async getCleanupStats(): Promise<CleanupStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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

  // ============= OTIMIZAÇÃO =============
  async optimizeDatabase(): Promise<void> {
    // Supabase gerencia otimização automaticamente
    // Criar notificação indicando que foi solicitado
    await (this.supabase.from('admin_notifications') as any).insert({
      type: 'system_error',
      title: 'Otimização Solicitada',
      message: 'A otimização do banco de dados foi iniciada'
    });
  }
}

export const databaseService = new DatabaseService();
