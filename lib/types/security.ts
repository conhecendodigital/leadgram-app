export interface SecuritySettings {
  id: string;
  require_2fa_admin: boolean;
  max_login_attempts: number;
  lockout_duration: number;
  enable_audit_log: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginAttempt {
  id: string;
  email?: string;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
  location_country?: string;
  location_city?: string;
  created_at: string;
}

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason?: string;
  failed_attempts: number;
  blocked_at: string;
  blocked_until?: string;
  blocked_by?: string;
  is_permanent: boolean;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  location_country?: string;
  location_city?: string;
  last_activity: string;
  created_at: string;
  expires_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface User2FA {
  id: string;
  user_id: string;
  enabled: boolean;
  secret?: string;
  backup_codes?: string[];
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Tipos auxiliares
export interface SecurityStats {
  totalLoginAttempts: number;
  failedLoginAttempts: number;
  blockedIPs: number;
  activeSessions: number;
  auditLogEntries: number;
  users2FAEnabled: number;
}

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'block_ip'
  | 'unblock_ip'
  | 'terminate_session'
  | 'enable_2fa'
  | 'disable_2fa'
  | 'settings_change';

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';
