-- =============================================
-- TABELA DE CONFIGURAÇÕES DO SISTEMA
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. Criar tabela de configurações globais
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'general', 'notifications', 'security', 'limits', 'email'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);

-- 3. Habilitar RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies - apenas admins podem ver e editar
CREATE POLICY "Admin can view settings" ON app_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. Inserir configurações padrão
INSERT INTO app_settings (key, value, description, category) VALUES
  -- Configurações Gerais
  ('app_name', '"Leadgram"', 'Nome da aplicação', 'general'),
  ('app_url', '"https://leadgram.app"', 'URL da aplicação', 'general'),
  ('maintenance_mode', 'false', 'Modo de manutenção ativado', 'general'),
  ('maintenance_message', '"Estamos em manutenção. Voltaremos em breve!"', 'Mensagem do modo de manutenção', 'general'),

  -- Limites de Planos
  ('free_max_ideas', '10', 'Máximo de ideias para plano Free', 'limits'),
  ('pro_max_ideas', '50', 'Máximo de ideias para plano Pro', 'limits'),
  ('premium_max_ideas', '-1', 'Máximo de ideias para plano Premium (-1 = ilimitado)', 'limits'),
  ('free_max_posts_per_month', '5', 'Máximo de posts por mês - Free', 'limits'),
  ('pro_max_posts_per_month', '30', 'Máximo de posts por mês - Pro', 'limits'),
  ('premium_max_posts_per_month', '-1', 'Máximo de posts por mês - Premium', 'limits'),

  -- Notificações
  ('notify_new_user', 'true', 'Notificar admin sobre novos usuários', 'notifications'),
  ('notify_new_payment', 'true', 'Notificar admin sobre novos pagamentos', 'notifications'),
  ('notify_cancellation', 'true', 'Notificar admin sobre cancelamentos', 'notifications'),
  ('notify_system_error', 'true', 'Notificar admin sobre erros críticos', 'notifications'),
  ('admin_notification_email', '"matheussss.afiliado@gmail.com"', 'Email para notificações admin', 'notifications'),

  -- Segurança
  ('require_2fa_admin', 'false', 'Exigir 2FA para admins', 'security'),
  ('login_attempt_limit', '5', 'Limite de tentativas de login', 'security'),
  ('enable_audit_log', 'true', 'Registrar log de auditoria', 'security'),
  ('session_timeout', '3600', 'Tempo de sessão em segundos', 'security'),

  -- Email
  ('email_provider', '"smtp"', 'Provedor de email', 'email'),
  ('email_from', '"noreply@leadgram.app"', 'Email de remetente', 'email'),
  ('email_from_name', '"Leadgram"', 'Nome de exibição do email', 'email'),
  ('smtp_host', '""', 'Host SMTP', 'email'),
  ('smtp_port', '587', 'Porta SMTP', 'email'),
  ('smtp_user', '""', 'Usuário SMTP', 'email'),
  ('smtp_password', '""', 'Senha SMTP (criptografada)', 'email')
ON CONFLICT (key) DO NOTHING;

-- 6. Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para atualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_app_settings_timestamp ON app_settings;
CREATE TRIGGER trigger_update_app_settings_timestamp
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_timestamp();

-- 8. Criar view para facilitar queries
CREATE OR REPLACE VIEW app_settings_view AS
SELECT
  key,
  value,
  description,
  category,
  updated_at,
  (SELECT email FROM auth.users WHERE id = updated_by) as updated_by_email
FROM app_settings;

-- 9. Grant permissions na view
GRANT SELECT ON app_settings_view TO authenticated;

-- 10. Verificar instalação
SELECT
  'Configurações instaladas com sucesso!' as status,
  COUNT(*) as total_settings
FROM app_settings;

-- =============================================
-- CONFIGURAÇÕES PRONTAS!
-- =============================================
