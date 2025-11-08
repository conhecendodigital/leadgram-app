-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO: Políticas RLS para Tabelas de Segurança
-- Permitir que o sistema registre eventos durante o processo de login
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. LOGIN_ATTEMPTS - Permitir INSERT sempre (sistema precisa registrar tentativas)
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Sistema pode registrar tentativas de login" ON login_attempts;
CREATE POLICY "Sistema pode registrar tentativas de login"
  ON login_attempts
  FOR INSERT
  WITH CHECK (true); -- Qualquer um pode inserir (inclusive não-autenticado)

-- Manter política de SELECT para admins
-- (já existe, criada na migration anterior)

-- ═══════════════════════════════════════════════════════════
-- 2. BLOCKED_IPS - Permitir INSERT do sistema
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Sistema pode bloquear IPs" ON blocked_ips;
CREATE POLICY "Sistema pode bloquear IPs"
  ON blocked_ips
  FOR INSERT
  WITH CHECK (true); -- Sistema pode inserir bloqueios automaticamente

-- Permitir SELECT para verificar se IP está bloqueado
DROP POLICY IF EXISTS "Sistema pode verificar IPs bloqueados" ON blocked_ips;
CREATE POLICY "Sistema pode verificar IPs bloqueados"
  ON blocked_ips
  FOR SELECT
  USING (true); -- Qualquer um pode ler (para verificar bloqueio)

-- Manter política de gerenciamento para admins
-- (já existe: "Admins podem gerenciar blocked_ips")

-- ═══════════════════════════════════════════════════════════
-- 3. ACTIVE_SESSIONS - Permitir INSERT após autenticação
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Sistema pode criar sessões" ON active_sessions;
CREATE POLICY "Sistema pode criar sessões"
  ON active_sessions
  FOR INSERT
  WITH CHECK (true); -- Sistema pode criar sessões após login bem-sucedido

-- Usuários podem atualizar suas próprias sessões (last_activity)
DROP POLICY IF EXISTS "Usuários podem atualizar suas sessões" ON active_sessions;
CREATE POLICY "Usuários podem atualizar suas sessões"
  ON active_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Manter política de SELECT existente
-- (já existe: "Usuários podem ver suas próprias sessões")

-- ═══════════════════════════════════════════════════════════
-- 4. AUDIT_LOGS - Permitir INSERT do sistema
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Sistema pode criar logs de auditoria" ON audit_logs;
CREATE POLICY "Sistema pode criar logs de auditoria"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true); -- Sistema pode criar logs sempre

-- Manter política de SELECT para admins
-- (já existe: "Admins podem ver audit_logs")

-- ═══════════════════════════════════════════════════════════
-- 5. SECURITY_SETTINGS - Permitir SELECT sempre
-- ═══════════════════════════════════════════════════════════

-- Sistema precisa ler as configurações durante login
DROP POLICY IF EXISTS "Sistema pode ler configurações de segurança" ON security_settings;
CREATE POLICY "Sistema pode ler configurações de segurança"
  ON security_settings
  FOR SELECT
  USING (true); -- Qualquer um pode ler configurações

-- Apenas admins podem UPDATE
DROP POLICY IF EXISTS "Admins podem atualizar security_settings" ON security_settings;
CREATE POLICY "Admins podem atualizar security_settings"
  ON security_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- VALIDAÇÃO
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Contar políticas das tabelas de segurança
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('login_attempts', 'blocked_ips', 'active_sessions', 'audit_logs', 'security_settings');

  RAISE NOTICE 'Total de políticas RLS de segurança criadas: %', policy_count;

  IF policy_count < 10 THEN
    RAISE WARNING 'Esperado pelo menos 10 políticas, encontrado %', policy_count;
  END IF;
END $$;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✓ Políticas RLS de segurança corrigidas';
  RAISE NOTICE '✓ Sistema pode agora registrar tentativas de login';
  RAISE NOTICE '✓ Sistema pode criar sessões e audit logs';
  RAISE NOTICE '✓ Sistema pode verificar e bloquear IPs';
END $$;
