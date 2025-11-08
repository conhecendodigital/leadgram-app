-- ════════════════════════════════════════════════════════════════
-- 🚀 CORREÇÃO DEFINITIVA DO SIGNUP
-- ════════════════════════════════════════════════════════════════
--
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
-- 2. Cole TODO este SQL
-- 3. Clique em RUN
-- 4. Aguarde a mensagem de sucesso
--
-- ════════════════════════════════════════════════════════════════

-- Criar tabela de configurações de notificações
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

-- Inserir configuração padrão (se não existir)
INSERT INTO admin_notification_settings (
  id, notify_new_users, notify_payments, notify_cancellations, notify_system_errors, email_on_errors
)
SELECT
  gen_random_uuid(), true, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM admin_notification_settings LIMIT 1);

-- Habilitar RLS
ALTER TABLE admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy para admins
DROP POLICY IF EXISTS "Only admin can manage notification settings" ON admin_notification_settings;
CREATE POLICY "Only admin can manage notification settings" ON admin_notification_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Melhorar trigger para não falhar
CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN := false;
BEGIN
  BEGIN
    SELECT COALESCE(notify_new_users, false) INTO settings_enabled
    FROM admin_notification_settings LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      settings_enabled := false;
  END;

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
        NULL; -- Ignora erro de notificação
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════
-- ✅ PRONTO! Agora teste o cadastro em:
--    http://localhost:3000/register
-- ════════════════════════════════════════════════════════════════
