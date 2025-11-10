-- =============================================
-- EMAIL SETTINGS SYSTEM
-- Sistema completo de configurações de email
-- =============================================

-- 1. Tabela de configurações de email
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Configurações do provedor
  provider VARCHAR(50) DEFAULT 'resend' CHECK (provider IN ('resend', 'smtp', 'sendgrid', 'mailgun', 'ses')),
  api_key TEXT, -- Criptografado no app

  -- Configurações de remetente
  from_email VARCHAR(255) DEFAULT 'noreply@leadgram.app',
  from_name VARCHAR(255) DEFAULT 'Leadgram',
  reply_to VARCHAR(255),

  -- SMTP settings (se provider = 'smtp')
  smtp_host VARCHAR(255),
  smtp_port INTEGER DEFAULT 587,
  smtp_user VARCHAR(255),
  smtp_password TEXT,
  smtp_secure BOOLEAN DEFAULT true,

  -- Configurações de envio
  enabled BOOLEAN DEFAULT true,
  daily_limit INTEGER DEFAULT 1000,
  emails_sent_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,

  -- Templates habilitados
  send_welcome_email BOOLEAN DEFAULT true,
  send_payment_confirmation BOOLEAN DEFAULT true,
  send_payment_failed BOOLEAN DEFAULT true,
  send_subscription_cancelled BOOLEAN DEFAULT true,
  send_password_reset BOOLEAN DEFAULT true,
  send_admin_notifications BOOLEAN DEFAULT true,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Inserir configuração padrão
INSERT INTO email_settings (
  id,
  provider,
  from_email,
  from_name,
  enabled,
  send_welcome_email,
  send_payment_confirmation,
  send_payment_failed,
  send_subscription_cancelled,
  send_password_reset,
  send_admin_notifications
)
VALUES (
  gen_random_uuid(),
  'resend',
  'noreply@leadgram.app',
  'Leadgram',
  false, -- Desabilitado até configurar API key
  true,
  true,
  true,
  true,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- 3. Tabela de histórico de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informações do email
  to_email VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_type VARCHAR(100),

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  provider_id VARCHAR(255), -- ID do provedor (ex: Resend message ID)
  error_message TEXT,

  -- Metadados
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_type ON email_logs(template_type);

-- 5. Função para resetar contador diário
CREATE OR REPLACE FUNCTION reset_daily_email_count()
RETURNS void AS $$
BEGIN
  UPDATE email_settings
  SET
    emails_sent_today = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para incrementar contador de emails
CREATE OR REPLACE FUNCTION increment_email_count()
RETURNS void AS $$
BEGIN
  -- Reset se necessário
  PERFORM reset_daily_email_count();

  -- Incrementar contador
  UPDATE email_settings
  SET emails_sent_today = emails_sent_today + 1
  WHERE id = (SELECT id FROM email_settings LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar configurações de email
DROP POLICY IF EXISTS "Admins podem gerenciar email_settings" ON email_settings;
CREATE POLICY "Admins podem gerenciar email_settings" ON email_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins podem ver todos os logs
DROP POLICY IF EXISTS "Admins podem ver email_logs" ON email_logs;
CREATE POLICY "Admins podem ver email_logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Usuários podem ver apenas seus próprios emails
DROP POLICY IF EXISTS "Usuarios podem ver seus email_logs" ON email_logs;
CREATE POLICY "Usuarios podem ver seus email_logs" ON email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 8. Comentários
COMMENT ON TABLE email_settings IS 'Configurações globais do sistema de email';
COMMENT ON TABLE email_logs IS 'Histórico de todos os emails enviados pela aplicação';
COMMENT ON FUNCTION reset_daily_email_count() IS 'Reseta o contador diário de emails enviados';
COMMENT ON FUNCTION increment_email_count() IS 'Incrementa o contador de emails enviados no dia';
