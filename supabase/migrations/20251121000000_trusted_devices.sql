-- =============================================
-- SISTEMA DE DISPOSITIVOS CONFIÁVEIS
-- =============================================
-- Implementa verificação de login por dispositivo
-- Quando usuário faz login de novo dispositivo, pede confirmação por email
-- =============================================

-- Tabela de dispositivos confiáveis
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL, -- Hash único do dispositivo (IP + User Agent)
  device_name TEXT, -- Nome amigável do dispositivo
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT, -- Chrome, Firefox, Safari, etc
  os TEXT, -- Windows, macOS, Linux, iOS, Android
  ip_address TEXT,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  trusted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON trusted_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_last_used ON trusted_devices(last_used_at DESC);

-- RLS Policies
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios dispositivos
CREATE POLICY "Usuários podem ver próprios dispositivos"
  ON trusted_devices FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios dispositivos
CREATE POLICY "Usuários podem deletar próprios dispositivos"
  ON trusted_devices FOR DELETE
  USING (auth.uid() = user_id);

-- Sistema pode inserir/atualizar dispositivos
CREATE POLICY "Sistema pode gerenciar dispositivos"
  ON trusted_devices FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentários
COMMENT ON TABLE trusted_devices IS 'Dispositivos confiáveis dos usuários para verificação de login';
COMMENT ON COLUMN trusted_devices.device_fingerprint IS 'Hash único baseado em IP + User Agent';
COMMENT ON COLUMN trusted_devices.last_used_at IS 'Último uso do dispositivo';
COMMENT ON COLUMN trusted_devices.trusted_at IS 'Quando o dispositivo foi marcado como confiável';

-- Função para limpar dispositivos antigos (>90 dias sem uso)
CREATE OR REPLACE FUNCTION clean_old_trusted_devices()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM trusted_devices
  WHERE last_used_at < NOW() - INTERVAL '90 days';
END;
$$;

COMMENT ON FUNCTION clean_old_trusted_devices IS 'Remove dispositivos que não são usados há mais de 90 dias';
