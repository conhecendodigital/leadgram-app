-- =============================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- Link: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
-- =============================================

-- 1. Criar tabela de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  events TEXT[] DEFAULT '{}',
  secret VARCHAR(255),
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  max_retries INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 60,
  timeout INTEGER DEFAULT 30,
  custom_headers JSONB DEFAULT '{}',
  total_calls INTEGER DEFAULT 0,
  success_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  last_called_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Criar tabela de logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  http_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempt INTEGER DEFAULT 1,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_by ON webhooks(created_by);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- 4. Função para atualizar estatísticas
CREATE OR REPLACE FUNCTION update_webhook_stats(
  webhook_uuid UUID,
  success BOOLEAN,
  error_msg TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE webhooks
  SET
    total_calls = total_calls + 1,
    success_calls = CASE WHEN success THEN success_calls + 1 ELSE success_calls END,
    failed_calls = CASE WHEN NOT success THEN failed_calls + 1 ELSE failed_calls END,
    last_called_at = NOW(),
    last_success_at = CASE WHEN success THEN NOW() ELSE last_success_at END,
    last_error = CASE WHEN NOT success THEN error_msg ELSE last_error END,
    status = CASE
      WHEN NOT success AND failed_calls >= 5 THEN 'error'::VARCHAR(50)
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = webhook_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Habilitar RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- 7. Policies
DROP POLICY IF EXISTS "Admins podem gerenciar webhooks" ON webhooks;
CREATE POLICY "Admins podem gerenciar webhooks" ON webhooks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins podem ver webhook_logs" ON webhook_logs;
CREATE POLICY "Admins podem ver webhook_logs" ON webhook_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 8. Inserir webhook padrão do Mercado Pago
INSERT INTO webhooks (name, url, description, events, enabled, status)
VALUES (
  'Mercado Pago',
  '/api/mercadopago/webhook',
  'Webhook oficial do Mercado Pago para notificações de pagamento',
  ARRAY['payment.created', 'payment.approved', 'payment.failed'],
  true,
  'active'
)
ON CONFLICT DO NOTHING;

-- ✅ PRONTO! Agora recarregue http://localhost:3000/admin/settings (aba Webhooks)
