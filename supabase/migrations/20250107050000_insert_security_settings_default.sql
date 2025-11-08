-- ═══════════════════════════════════════════════════════════
-- GARANTIR CONFIGURAÇÃO PADRÃO DE SEGURANÇA
-- ═══════════════════════════════════════════════════════════

-- Inserir configuração padrão SE não existir nenhuma
DO $$
BEGIN
  -- Verificar se a tabela está vazia
  IF NOT EXISTS (SELECT 1 FROM security_settings LIMIT 1) THEN
    -- Inserir configuração padrão
    INSERT INTO security_settings (
      require_2fa_admin,
      max_login_attempts,
      lockout_duration,
      enable_audit_log
    ) VALUES (
      false,  -- 2FA desativado por padrão
      5,      -- 5 tentativas de login
      15,     -- 15 minutos de bloqueio
      true    -- Audit log ativado
    );

    RAISE NOTICE 'Configuração padrão de segurança criada ✓';
  ELSE
    RAISE NOTICE 'Configuração de segurança já existe ✓';
  END IF;
END $$;

-- Validar
DO $$
DECLARE
  settings_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO settings_count FROM security_settings;

  IF settings_count = 0 THEN
    RAISE EXCEPTION 'ERRO: security_settings ainda está vazio!';
  END IF;

  RAISE NOTICE 'Total de configurações de segurança: %', settings_count;
END $$;
