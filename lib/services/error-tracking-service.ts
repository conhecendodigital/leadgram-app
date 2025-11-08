import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export class ErrorTrackingService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

  /**
   * Registra um erro no banco de dados
   * @param error - Objeto de erro ou mensagem
   * @param severity - Nível de severidade (info, warning, error, critical)
   * @param metadata - Dados adicionais sobre o erro
   */
  async logError(
    error: Error | string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
    metadata?: Record<string, any>
  ) {
    try {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const user = (await this.supabase.auth.getUser()).data.user;

      // Apenas em ambiente browser
      const url = typeof window !== 'undefined' ? window.location.href : 'server';
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server';

      const { error: insertError } = await (this.supabase
        .from('error_logs') as any)
        .insert({
          error_type: errorObj.name || 'Error',
          error_message: errorObj.message,
          stack_trace: errorObj.stack,
          url,
          user_id: user?.id,
          user_agent: userAgent,
          severity,
          metadata: metadata || {}
        });

      if (insertError) {
        console.error('Falha ao registrar erro no banco:', insertError);
      }
    } catch (e) {
      // Silenciosamente falha para não criar loop de erros
      console.error('Falha ao registrar erro:', e);
    }
  }

  /**
   * Registra um erro crítico (cria notificação automática via trigger)
   * @param error - Objeto de erro ou mensagem
   * @param context - Contexto adicional sobre onde o erro ocorreu
   */
  async logCriticalError(error: Error | string, context?: string) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    await this.logError(errorObj, 'critical', {
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registra um aviso (não cria notificação)
   * @param message - Mensagem de aviso
   * @param metadata - Dados adicionais
   */
  async logWarning(message: string, metadata?: Record<string, any>) {
    await this.logError(new Error(message), 'warning', metadata);
  }

  /**
   * Registra informação (não cria notificação)
   * @param message - Mensagem informativa
   * @param metadata - Dados adicionais
   */
  async logInfo(message: string, metadata?: Record<string, any>) {
    await this.logError(new Error(message), 'info', metadata);
  }

  /**
   * Busca logs de erro (apenas para admins)
   * @param limit - Número de logs a retornar
   * @param severity - Filtrar por severidade
   */
  async getLogs(limit = 50, severity?: 'info' | 'warning' | 'error' | 'critical') {
    try {
      let query = (this.supabase
        .from('error_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (severity) {
        query = query.eq('severity', severity);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
  }

  /**
   * Limpa logs antigos (apenas para admins)
   * @param daysOld - Remover logs mais antigos que X dias
   */
  async cleanupOldLogs(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await (this.supabase
        .from('error_logs') as any)
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select();

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      throw error;
    }
  }
}

// Lazy-loaded singleton for client-side usage
let _errorTrackingInstance: ErrorTrackingService | null = null;
export const errorTracking = {
  get instance() {
    if (!_errorTrackingInstance) {
      _errorTrackingInstance = new ErrorTrackingService();
    }
    return _errorTrackingInstance;
  }
};
