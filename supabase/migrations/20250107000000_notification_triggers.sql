-- ═══════════════════════════════════════════════════════════
-- SISTEMA DE NOTIFICAÇÕES AUTOMÁTICAS
-- Triggers para criar notificações em tempo real
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. NOTIFICAÇÃO DE NOVOS USUÁRIOS
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN;
BEGIN
  -- Verificar se notificação está ativada
  SELECT notify_new_users INTO settings_enabled
  FROM admin_notification_settings
  LIMIT 1;

  -- Só cria notificação se estiver ativado
  IF settings_enabled THEN
    INSERT INTO admin_notifications (type, title, message, user_id, link)
    VALUES (
      'new_user',
      'Novo Usuário Registrado',
      'Um novo usuário acabou de se registrar no sistema: ' || COALESCE(NEW.email, 'Email não disponível'),
      NEW.id,
      '/admin/clientes'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para quando usuário é criado
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_user();

-- ═══════════════════════════════════════════════════════════
-- 2. NOTIFICAÇÃO DE PAGAMENTOS
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_new_payment()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN;
  user_email TEXT;
BEGIN
  -- Só notifica se pagamento foi completado/approved
  IF NEW.status IN ('completed', 'approved') THEN
    -- Verificar se notificação está ativada
    SELECT notify_payments INTO settings_enabled
    FROM admin_notification_settings
    LIMIT 1;

    -- Buscar email do usuário
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    IF settings_enabled THEN
      INSERT INTO admin_notifications (type, title, message, user_id, link, metadata)
      VALUES (
        'payment',
        'Novo Pagamento Recebido',
        'Pagamento de R$ ' || NEW.amount || ' recebido de ' || COALESCE(user_email, 'usuário'),
        NEW.user_id,
        '/admin/pagamentos',
        jsonb_build_object(
          'payment_id', NEW.id,
          'amount', NEW.amount,
          'payment_method', NEW.payment_method
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payment_completed ON payments;
CREATE TRIGGER on_payment_completed
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_payment();

-- ═══════════════════════════════════════════════════════════
-- 3. NOTIFICAÇÃO DE CANCELAMENTOS
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN;
  user_email TEXT;
BEGIN
  -- Só notifica se status mudou para cancelled
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    -- Verificar se notificação está ativada
    SELECT notify_cancellations INTO settings_enabled
    FROM admin_notification_settings
    LIMIT 1;

    -- Buscar email do usuário
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    IF settings_enabled THEN
      INSERT INTO admin_notifications (type, title, message, user_id, link, metadata)
      VALUES (
        'cancellation',
        'Assinatura Cancelada',
        COALESCE(user_email, 'Um usuário') || ' cancelou a assinatura do plano ' || NEW.plan_type,
        NEW.user_id,
        '/admin/clientes',
        jsonb_build_object(
          'subscription_id', NEW.id,
          'plan', NEW.plan_type
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_cancelled ON user_subscriptions;
CREATE TRIGGER on_subscription_cancelled
  AFTER UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_cancellation();

-- ═══════════════════════════════════════════════════════════
-- 4. TABELA DE LOGS DE ERROS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(100),
  error_message TEXT,
  stack_trace TEXT,
  url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);

-- RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver todos os erros" ON error_logs;
CREATE POLICY "Admins podem ver todos os erros" ON error_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- 5. NOTIFICAÇÃO DE ERROS CRÍTICOS
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_critical_error()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN;
BEGIN
  -- Só notifica erros críticos
  IF NEW.severity = 'critical' THEN
    -- Verificar se notificação está ativada
    SELECT notify_system_errors INTO settings_enabled
    FROM admin_notification_settings
    LIMIT 1;

    IF settings_enabled THEN
      INSERT INTO admin_notifications (type, title, message, link, metadata)
      VALUES (
        'system_error',
        'Erro Crítico do Sistema',
        SUBSTRING(NEW.error_message, 1, 200),
        '/admin/logs',
        jsonb_build_object(
          'error_id', NEW.id,
          'error_type', NEW.error_type,
          'severity', NEW.severity,
          'url', NEW.url
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_critical_error ON error_logs;
CREATE TRIGGER on_critical_error
  AFTER INSERT ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_critical_error();

-- ═══════════════════════════════════════════════════════════
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ═══════════════════════════════════════════════════════════

COMMENT ON FUNCTION notify_new_user() IS 'Cria notificação automática quando um novo usuário se registra';
COMMENT ON FUNCTION notify_new_payment() IS 'Cria notificação automática quando um pagamento é completado';
COMMENT ON FUNCTION notify_cancellation() IS 'Cria notificação automática quando uma assinatura é cancelada';
COMMENT ON FUNCTION notify_critical_error() IS 'Cria notificação automática quando um erro crítico ocorre';

COMMENT ON TABLE error_logs IS 'Registro de erros do sistema para monitoramento e debugging';
