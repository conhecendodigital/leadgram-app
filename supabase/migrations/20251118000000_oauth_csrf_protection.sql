-- Migration: OAuth CSRF Protection
-- Cria tabela para armazenar estados temporários do OAuth (prevenir CSRF attacks)
-- Data: 2025-11-18

-- Tabela para armazenar OAuth states (tokens anti-CSRF)
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'instagram', 'google_drive', etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Índice para busca rápida por state
CREATE INDEX idx_oauth_states_state ON oauth_states(state);

-- Índice para busca por user_id
CREATE INDEX idx_oauth_states_user_id ON oauth_states(user_id);

-- Índice para limpeza de estados expirados
CREATE INDEX idx_oauth_states_expires_at ON oauth_states(expires_at);

-- RLS: Usuários podem ver apenas seus próprios states
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own oauth states"
  ON oauth_states
  FOR SELECT
  USING (auth.uid() = user_id);

-- Função para limpar estados expirados (executar via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states
  WHERE expires_at < NOW()
     OR (used = TRUE AND created_at < NOW() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE oauth_states IS 'Armazena estados temporários para OAuth (CSRF protection)';
COMMENT ON COLUMN oauth_states.state IS 'Token aleatório único para validar callback OAuth';
COMMENT ON COLUMN oauth_states.provider IS 'Provider OAuth (instagram, google_drive, etc)';
COMMENT ON COLUMN oauth_states.expires_at IS 'Data de expiração do state (5 minutos após criação)';
COMMENT ON COLUMN oauth_states.used IS 'Se o state já foi utilizado (não pode reusar)';
