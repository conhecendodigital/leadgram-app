-- Migration: Automation Settings e Sync History
-- Data: 2025-11-21
-- Descrição: Tabelas para controle de automações e histórico de sincronizações

-- =====================================================
-- 1. Tabela: automation_settings
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN ('hourly', 'daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automation_settings_user_id ON automation_settings(user_id);

-- RLS (Row Level Security)
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias configurações
CREATE POLICY "Users can view own automation settings"
  ON automation_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir suas próprias configurações
CREATE POLICY "Users can insert own automation settings"
  ON automation_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias configurações
CREATE POLICY "Users can update own automation settings"
  ON automation_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias configurações
CREATE POLICY "Users can delete own automation settings"
  ON automation_settings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. Tabela: sync_history
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'auto')),
  sync_source TEXT CHECK (sync_source IN ('instagram', 'tiktok', 'youtube', 'facebook', 'all')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'in_progress')),
  new_posts INT DEFAULT 0,
  updated_posts INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sync_history_user_id ON sync_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_created_at ON sync_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_history_status ON sync_history(status);

-- RLS (Row Level Security)
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seu próprio histórico
CREATE POLICY "Users can view own sync history"
  ON sync_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Sistema pode inserir histórico (service role)
CREATE POLICY "Service can insert sync history"
  ON sync_history FOR INSERT
  WITH CHECK (true);

-- Policy: Sistema pode atualizar histórico (service role)
CREATE POLICY "Service can update sync history"
  ON sync_history FOR UPDATE
  USING (true);

-- =====================================================
-- 3. Função: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_automation_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_automation_settings_updated_at
  BEFORE UPDATE ON automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_settings_updated_at();

-- =====================================================
-- 4. Função: Limpar histórico antigo (> 90 dias)
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_sync_history()
RETURNS void AS $$
BEGIN
  DELETE FROM sync_history
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Inserir configurações padrão para usuários existentes
-- =====================================================
INSERT INTO automation_settings (user_id, auto_sync_enabled, sync_frequency)
SELECT
  id,
  true,
  'daily'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM automation_settings)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- 6. Comentários
-- =====================================================
COMMENT ON TABLE automation_settings IS 'Configurações de automação por usuário';
COMMENT ON TABLE sync_history IS 'Histórico de sincronizações (manual e automática)';
COMMENT ON COLUMN automation_settings.auto_sync_enabled IS 'Se true, cron jobs sincronizam automaticamente';
COMMENT ON COLUMN automation_settings.sync_frequency IS 'Frequência de sincronização: hourly, daily, weekly';
COMMENT ON COLUMN sync_history.sync_type IS 'Tipo: manual (usuário clicou) ou auto (cron job)';
COMMENT ON COLUMN sync_history.status IS 'Status: success, error, in_progress';
COMMENT ON COLUMN sync_history.duration_ms IS 'Duração da sincronização em milissegundos';
