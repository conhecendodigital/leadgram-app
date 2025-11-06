-- =============================================
-- DATABASE MANAGEMENT SYSTEM
-- =============================================

-- 1. Tabela de backups
CREATE TABLE IF NOT EXISTS database_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'failed', 'processing'
  backup_type VARCHAR(50) DEFAULT 'manual', -- 'manual', 'automatic'
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_database_backups_created_at ON database_backups(created_at DESC);

-- 2. Tabela de configuração de backup automático
CREATE TABLE IF NOT EXISTS database_backup_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT false,
  frequency VARCHAR(50) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  time VARCHAR(10) DEFAULT '02:00', -- Horário no formato HH:MM
  day_of_week INTEGER, -- 0-6 para semanal (0=domingo)
  day_of_month INTEGER, -- 1-31 para mensal
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inserir configuração padrão
INSERT INTO database_backup_config (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- 4. Políticas RLS (apenas admins)
ALTER TABLE database_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_backup_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem gerenciar backups" ON database_backups;
CREATE POLICY "Admins podem gerenciar backups" ON database_backups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins podem gerenciar config" ON database_backup_config;
CREATE POLICY "Admins podem gerenciar config" ON database_backup_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
