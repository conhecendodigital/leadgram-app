-- =============================================
-- ADMIN NOTIFICATIONS SYSTEM
-- =============================================

-- 1. Tabela de notificações do admin
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('new_user', 'payment', 'cancellation', 'system_error')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  link VARCHAR(500)
);

-- 2. Tabela de configurações de notificações
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

-- 3. Inserir configuração padrão
INSERT INTO admin_notification_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);

-- 5. Habilitar RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- 6. Policies para admin_notifications (apenas admins podem ver/gerenciar)
DROP POLICY IF EXISTS "Only admin can manage notifications" ON admin_notifications;
CREATE POLICY "Only admin can manage notifications" ON admin_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 7. Policies para admin_notification_settings (apenas admins)
DROP POLICY IF EXISTS "Only admin can manage notification settings" ON admin_notification_settings;
CREATE POLICY "Only admin can manage notification settings" ON admin_notification_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
