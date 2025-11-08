-- ═══════════════════════════════════════════════════════════
-- SISTEMA DE SEGURANÇA ADMIN
-- Implementa 6 funcionalidades: 2FA, Login Attempts, Audit Log,
-- Active Sessions, Access History, Blocked IPs
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. TABELA DE CONFIGURAÇÕES DE SEGURANÇA
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  require_2fa_admin BOOLEAN DEFAULT false,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration INTEGER DEFAULT 15, -- minutos
  enable_audit_log BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO security_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 2. TABELA DE TENTATIVAS DE LOGIN
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason VARCHAR(255),
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);

-- ═══════════════════════════════════════════════════════════
-- 3. TABELA DE IPs BLOQUEADOS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  reason TEXT,
  failed_attempts INTEGER DEFAULT 0,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- admin que bloqueou manualmente
  is_permanent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_blocked_until ON blocked_ips(blocked_until);

-- ═══════════════════════════════════════════════════════════
-- 4. TABELA DE SESSÕES ATIVAS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50), -- desktop, mobile, tablet
  browser VARCHAR(100),
  os VARCHAR(100),
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_activity ON active_sessions(last_activity DESC);

-- ═══════════════════════════════════════════════════════════
-- 5. TABELA DE LOG DE AUDITORIA
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- login, logout, create, update, delete, etc
  resource_type VARCHAR(100), -- user, idea, payment, settings, etc
  resource_id UUID,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- 6. TABELA DE 2FA
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  secret VARCHAR(255), -- TOTP secret
  backup_codes TEXT[], -- Array de códigos de backup
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_2fa(user_id);

-- ═══════════════════════════════════════════════════════════
-- 7. POLÍTICAS RLS
-- ═══════════════════════════════════════════════════════════

-- Security Settings
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem gerenciar security_settings" ON security_settings;
CREATE POLICY "Admins podem gerenciar security_settings" ON security_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Login Attempts
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver login_attempts" ON login_attempts;
CREATE POLICY "Admins podem ver login_attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Blocked IPs
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem gerenciar blocked_ips" ON blocked_ips;
CREATE POLICY "Admins podem gerenciar blocked_ips" ON blocked_ips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Active Sessions
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver todas as sessões" ON active_sessions;
CREATE POLICY "Admins podem ver todas as sessões" ON active_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Usuários podem ver suas próprias sessões" ON active_sessions;
CREATE POLICY "Usuários podem ver suas próprias sessões" ON active_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver audit_logs" ON audit_logs;
CREATE POLICY "Admins podem ver audit_logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- User 2FA
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem gerenciar seu próprio 2FA" ON user_2fa;
CREATE POLICY "Usuários podem gerenciar seu próprio 2FA" ON user_2fa
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- 8. FUNÇÕES AUXILIARES
-- ═══════════════════════════════════════════════════════════

-- Limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM active_sessions
  WHERE expires_at < NOW()
  OR last_activity < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Desbloquear IPs automaticamente
CREATE OR REPLACE FUNCTION unblock_expired_ips()
RETURNS INTEGER AS $$
DECLARE
  unblocked_count INTEGER;
BEGIN
  DELETE FROM blocked_ips
  WHERE NOT is_permanent
  AND blocked_until IS NOT NULL
  AND blocked_until < NOW();

  GET DIAGNOSTICS unblocked_count = ROW_COUNT;
  RETURN unblocked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se IP está bloqueado
CREATE OR REPLACE FUNCTION is_ip_blocked(check_ip VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_ips
    WHERE ip_address = check_ip
    AND (is_permanent OR blocked_until > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ═══════════════════════════════════════════════════════════

COMMENT ON TABLE security_settings IS 'Configurações globais de segurança do sistema';
COMMENT ON TABLE login_attempts IS 'Registro de todas as tentativas de login (sucesso e falha)';
COMMENT ON TABLE blocked_ips IS 'IPs bloqueados por excesso de tentativas ou manualmente';
COMMENT ON TABLE active_sessions IS 'Sessões ativas dos usuários';
COMMENT ON TABLE audit_logs IS 'Log de auditoria de todas as ações administrativas';
COMMENT ON TABLE user_2fa IS 'Configurações de autenticação de dois fatores por usuário';

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Remove sessões expiradas ou inativas há mais de 7 dias';
COMMENT ON FUNCTION unblock_expired_ips() IS 'Remove bloqueios temporários de IPs que já expiraram';
COMMENT ON FUNCTION is_ip_blocked(VARCHAR) IS 'Verifica se um IP específico está bloqueado';
