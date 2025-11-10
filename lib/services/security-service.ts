import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  SecuritySettings,
  LoginAttempt,
  BlockedIP,
  ActiveSession,
  AuditLog,
  User2FA,
  SecurityStats
} from '@/lib/types/security';

export class SecurityService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

  // ============= CONFIGURAÇÕES =============
  async getSettings(): Promise<SecuritySettings> {
    const { data, error } = await (this.supabase
      .from('security_settings') as any)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    // Se não existe, criar configuração padrão
    if (!data) {
      const { data: newSettings, error: insertError } = await (this.supabase
        .from('security_settings') as any)
        .insert({
          require_2fa_admin: false,
          max_login_attempts: 5,
          lockout_duration: 15,
          enable_audit_log: true
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      return newSettings as SecuritySettings;
    }

    return data as SecuritySettings;
  }

  async updateSettings(settings: Partial<SecuritySettings>): Promise<void> {
    const current = await this.getSettings();

    const { error } = await (this.supabase
      .from('security_settings') as any)
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id);

    if (error) throw error;

    // Log de auditoria
    await this.logAction('settings_change', 'security_settings', current.id, 'Configurações de segurança atualizadas', settings);
  }

  // ============= LOGIN ATTEMPTS =============
  async recordLoginAttempt(
    email: string,
    ipAddress: string,
    success: boolean,
    userAgent?: string,
    failureReason?: string
  ): Promise<void> {
    const { error } = await (this.supabase
      .from('login_attempts') as any)
      .insert({
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        failure_reason: failureReason
      });

    if (error) throw error;

    // Se falhou, verificar se deve bloquear IP
    if (!success) {
      await this.checkAndBlockIP(ipAddress, email);
    }
  }

  async getLoginAttempts(limit = 50): Promise<LoginAttempt[]> {
    const { data, error } = await (this.supabase
      .from('login_attempts') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as LoginAttempt[];
  }

  async getFailedAttemptsByIP(ipAddress: string, minutes = 15): Promise<number> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - minutes);

    const { count, error } = await (this.supabase
      .from('login_attempts') as any)
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .eq('success', false)
      .gte('created_at', since.toISOString());

    if (error) throw error;
    return count || 0;
  }

  // ============= BLOCKED IPs =============
  async isIPBlocked(ipAddress: string): Promise<boolean> {
    try {
      const { data, error } = await (this.supabase.rpc as any)(
        'is_ip_blocked',
        { check_ip: ipAddress }
      );

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar IP bloqueado:', error);
      return false;
    }
  }

  private async checkAndBlockIP(ipAddress: string, email?: string): Promise<void> {
    const settings = await this.getSettings();
    const failedAttempts = await this.getFailedAttemptsByIP(ipAddress, 15);

    if (failedAttempts >= settings.max_login_attempts) {
      const blockedUntil = new Date();
      blockedUntil.setMinutes(blockedUntil.getMinutes() + settings.lockout_duration);

      await (this.supabase
        .from('blocked_ips') as any)
        .upsert({
          ip_address: ipAddress,
          reason: `${failedAttempts} tentativas de login falhas${email ? ` para ${email}` : ''}`,
          failed_attempts: failedAttempts,
          blocked_until: blockedUntil.toISOString(),
          is_permanent: false
        }, {
          onConflict: 'ip_address'
        });

      // Log de auditoria
      await this.logAction('block_ip', 'blocked_ips', undefined, `IP ${ipAddress} bloqueado automaticamente`, { ip: ipAddress, attempts: failedAttempts });
    }
  }

  async getBlockedIPs(): Promise<BlockedIP[]> {
    const { data, error} = await (this.supabase
      .from('blocked_ips') as any)
      .select('*')
      .order('blocked_at', { ascending: false });

    if (error) throw error;
    return data as BlockedIP[];
  }

  async blockIP(
    ipAddress: string,
    reason: string,
    failedAttempts?: number,
    blockedUntil?: Date,
    permanent = false
  ): Promise<void> {
    const user = (await this.supabase.auth.getUser()).data.user;

    // Se blockedUntil não for fornecido, usar 24h por padrão
    const defaultBlockedUntil = permanent
      ? null
      : (blockedUntil || new Date(Date.now() + 24 * 60 * 60 * 1000)).toISOString();

    const { error } = await (this.supabase
      .from('blocked_ips') as any)
      .insert({
        ip_address: ipAddress,
        reason,
        is_permanent: permanent,
        blocked_by: user?.id,
        blocked_until: defaultBlockedUntil,
        failed_attempts: failedAttempts || 0
      });

    if (error) throw error;

    // Log de auditoria
    await this.logAction('block_ip', 'blocked_ips', undefined, `IP ${ipAddress} bloqueado`, { ip: ipAddress, reason, permanent, failedAttempts });
  }

  async unblockIP(id: string): Promise<void> {
    // Buscar IP antes de deletar para o log
    const { data: blocked } = await (this.supabase
      .from('blocked_ips') as any)
      .select('ip_address')
      .eq('id', id)
      .maybeSingle();

    const { error } = await (this.supabase
      .from('blocked_ips') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log de auditoria
    if (blocked) {
      await this.logAction('unblock_ip', 'blocked_ips', id, `IP ${blocked.ip_address} desbloqueado`);
    }
  }

  // ============= SESSÕES ATIVAS =============
  async createSession(
    userId: string,
    sessionToken: string,
    ipAddress: string,
    userAgent?: string,
    deviceType?: string,
    browser?: string,
    os?: string,
    locationCountry?: string,
    locationCity?: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Sessão expira em 7 dias

    const { error } = await (this.supabase
      .from('active_sessions') as any)
      .insert({
        user_id: userId,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
        browser,
        os,
        location_country: locationCountry,
        location_city: locationCity,
        last_activity: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;
  }

  async getActiveSessions(userId?: string): Promise<ActiveSession[]> {
    let query = (this.supabase
      .from('active_sessions') as any)
      .select('*')
      .order('last_activity', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ActiveSession[];
  }

  async terminateSession(sessionId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('active_sessions') as any)
      .delete()
      .eq('id', sessionId);

    if (error) throw error;

    // Log de auditoria
    await this.logAction('terminate_session', 'active_sessions', sessionId, 'Sessão terminada manualmente');
  }

  async terminateAllOtherSessions(currentSessionToken: string): Promise<void> {
    const user = (await this.supabase.auth.getUser()).data.user;

    const { error } = await (this.supabase
      .from('active_sessions') as any)
      .delete()
      .eq('user_id', user?.id!)
      .neq('session_token', currentSessionToken);

    if (error) throw error;

    // Log de auditoria
    await this.logAction('terminate_session', 'active_sessions', undefined, 'Todas as outras sessões foram terminadas');
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await (this.supabase.rpc as any)(
        'cleanup_expired_sessions'
      );

      if (error) throw error;
      return (data as number) || 0;
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error);
      return 0;
    }
  }

  // ============= AUDIT LOG =============
  async logAction(
    action: string,
    resourceType?: string,
    resourceId?: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const user = (await this.supabase.auth.getUser()).data.user;

      await (this.supabase
        .from('audit_logs') as any)
        .insert({
          user_id: user?.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          description,
          metadata: metadata || {}
        });
    } catch (error) {
      // Silenciosamente falha para não quebrar operações
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  async getAuditLogs(limit = 50, userId?: string, action?: string): Promise<AuditLog[]> {
    let query = (this.supabase
      .from('audit_logs') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AuditLog[];
  }

  // ============= 2FA =============
  async enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    const { error } = await (this.supabase
      .from('user_2fa') as any)
      .upsert({
        user_id: userId,
        enabled: true,
        secret,
        backup_codes: backupCodes,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;

    // Log de auditoria
    await this.logAction('enable_2fa', 'user_2fa', userId, '2FA ativado');
  }

  async disable2FA(userId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('user_2fa') as any)
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    // Log de auditoria
    await this.logAction('disable_2fa', 'user_2fa', userId, '2FA desativado');
  }

  async get2FAStatus(userId: string): Promise<User2FA | null> {
    const { data, error } = await (this.supabase
      .from('user_2fa') as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data as User2FA | null;
  }

  // ============= ESTATÍSTICAS =============
  async getSecurityStats(): Promise<SecurityStats> {
    const [
      loginAttemptsResult,
      failedAttemptsResult,
      blockedIPsResult,
      activeSessionsResult,
      auditLogsResult,
      users2FAResult
    ] = await Promise.all([
      (this.supabase.from('login_attempts') as any).select('*', { count: 'exact', head: true }),
      (this.supabase.from('login_attempts') as any).select('*', { count: 'exact', head: true }).eq('success', false),
      (this.supabase.from('blocked_ips') as any).select('*', { count: 'exact', head: true }),
      (this.supabase.from('active_sessions') as any).select('*', { count: 'exact', head: true }),
      (this.supabase.from('audit_logs') as any).select('*', { count: 'exact', head: true }),
      (this.supabase.from('user_2fa') as any).select('*', { count: 'exact', head: true }).eq('enabled', true)
    ]);

    return {
      totalLoginAttempts: loginAttemptsResult.count || 0,
      failedLoginAttempts: failedAttemptsResult.count || 0,
      blockedIPs: blockedIPsResult.count || 0,
      activeSessions: activeSessionsResult.count || 0,
      auditLogEntries: auditLogsResult.count || 0,
      users2FAEnabled: users2FAResult.count || 0
    };
  }

  // ============= LIMPEZA =============
  async unblockExpiredIPs(): Promise<number> {
    try {
      const { data, error } = await (this.supabase.rpc as any)(
        'unblock_expired_ips'
      );

      if (error) throw error;
      return (data as number) || 0;
    } catch (error) {
      console.error('Erro ao desbloquear IPs expirados:', error);
      return 0;
    }
  }
}

// Lazy-loaded singleton for client-side usage
let _securityServiceInstance: SecurityService | null = null;
export const securityService = {
  get instance() {
    if (!_securityServiceInstance) {
      _securityServiceInstance = new SecurityService();
    }
    return _securityServiceInstance;
  }
};
