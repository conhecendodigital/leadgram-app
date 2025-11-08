-- ════════════════════════════════════════════════════════════════
-- 🔧 CORREÇÃO: Criar tabela admin_notification_settings
-- ════════════════════════════════════════════════════════════════
--
-- Problema: Trigger notify_new_user() tenta ler da tabela
-- admin_notification_settings mas ela não existe, causando
-- "Database error creating new user"
--
-- Solução: Criar a tabela e inserir dados padrão
--
-- ════════════════════════════════════════════════════════════════

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🔧 CRIANDO TABELA admin_notification_settings';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- 1. Criar tabela de configurações de notificações
CREATE TABLE IF NOT EXISTS admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notify_new_users BOOLEAN DEFAULT true,
  notify_payments BOOLEAN DEFAULT true,
  notify_cancellations BOOLEAN DEFAULT true,
  notify_system_errors BOOLEAN DEFAULT true,
  email_on_errors BOOLEAN DEFAULT true,
  admin_email VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  RAISE NOTICE '✓ Tabela admin_notification_settings criada';
  RAISE NOTICE '';
END $$;

-- 2. Inserir configuração padrão (se não existir)
INSERT INTO admin_notification_settings (
  id,
  notify_new_users,
  notify_payments,
  notify_cancellations,
  notify_system_errors,
  email_on_errors
)
SELECT
  gen_random_uuid(),
  true,
  true,
  true,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM admin_notification_settings LIMIT 1
);

DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM admin_notification_settings;
  RAISE NOTICE '✓ Configuração padrão inserida';
  RAISE NOTICE '✓ Total de linhas na tabela: %', row_count;
  RAISE NOTICE '';
END $$;

-- 3. Habilitar RLS
ALTER TABLE admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policy para admin_notification_settings (apenas admins)
DROP POLICY IF EXISTS "Only admin can manage notification settings" ON admin_notification_settings;
CREATE POLICY "Only admin can manage notification settings" ON admin_notification_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✓ RLS e policies configuradas';
  RAISE NOTICE '';
END $$;

-- 5. Melhorar trigger para não falhar se tabela não existir
CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN := false;
BEGIN
  -- Tentar ler configuração (com tratamento de erro)
  BEGIN
    SELECT COALESCE(notify_new_users, false) INTO settings_enabled
    FROM admin_notification_settings
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      -- Se falhar (tabela não existe, etc), desabilita notificação
      settings_enabled := false;
      RAISE WARNING 'notify_new_user: Não foi possível verificar configurações: %', SQLERRM;
  END;

  -- Só cria notificação se estiver ativado
  IF settings_enabled THEN
    BEGIN
      INSERT INTO admin_notifications (type, title, message, user_id, link)
      VALUES (
        'new_user',
        'Novo Usuário Registrado',
        'Um novo usuário acabou de se registrar no sistema: ' || COALESCE(NEW.email, 'Email não disponível'),
        NEW.id,
        '/admin/clientes'
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Se falhar ao inserir notificação, apenas loga mas NÃO bloqueia signup
        RAISE WARNING 'notify_new_user: Não foi possível criar notificação: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;  -- SEMPRE retorna NEW (nunca bloqueia signup)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  RAISE NOTICE '✓ Função notify_new_user() atualizada com tratamento de erro';
  RAISE NOTICE '';
END $$;

-- 6. Validação final
DO $$
DECLARE
  table_exists BOOLEAN;
  row_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '✅ VALIDAÇÃO FINAL';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';

  -- Verificar se tabela existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'admin_notification_settings'
  ) INTO table_exists;

  -- Contar linhas
  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM admin_notification_settings;
  ELSE
    row_count := 0;
  END IF;

  RAISE NOTICE '📊 Resultados:';
  RAISE NOTICE '   Tabela admin_notification_settings existe: %', table_exists;
  RAISE NOTICE '   Linhas na tabela: %', row_count;
  RAISE NOTICE '';

  IF table_exists AND row_count > 0 THEN
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '🎉 CORREÇÃO APLICADA COM SUCESSO!';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tabela admin_notification_settings criada';
    RAISE NOTICE '✅ Configuração padrão inserida';
    RAISE NOTICE '✅ Trigger notify_new_user() com tratamento de erro';
    RAISE NOTICE '✅ Signup deve funcionar agora!';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Próximo passo: Testar signup';
    RAISE NOTICE '   Acesse: http://localhost:3000/register';
    RAISE NOTICE '';
  ELSE
    RAISE WARNING '⚠️ Algo deu errado na criação da tabela!';
  END IF;
END $$;

COMMIT;
