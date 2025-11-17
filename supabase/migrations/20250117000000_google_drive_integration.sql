-- Tabela para armazenar conexões do Google Drive por usuário
-- Permite que cada usuário conecte sua conta Google Drive
-- e armazene vídeos das ideias diretamente no Drive pessoal

CREATE TABLE IF NOT EXISTS google_drive_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,

  -- Google Drive info
  folder_id TEXT, -- ID da pasta "Ideias" no Google Drive
  email TEXT, -- Email da conta Google conectada

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: um usuário só pode ter uma conexão ativa
  UNIQUE(user_id)
);

-- Adicionar coluna drive_video_ids na tabela ideas para armazenar IDs dos vídeos no Drive
-- Usamos JSONB para permitir múltiplos vídeos por ideia
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS drive_video_ids JSONB DEFAULT '[]'::jsonb;

-- Adicionar coluna drive_folder_id na tabela ideas para armazenar ID da subpasta específica da ideia
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- Índices para performance
CREATE INDEX idx_google_drive_accounts_user ON google_drive_accounts(user_id);
CREATE INDEX idx_google_drive_accounts_active ON google_drive_accounts(is_active);
CREATE INDEX idx_ideas_drive_folder ON ideas(drive_folder_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_google_drive_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_google_drive_accounts_updated_at
  BEFORE UPDATE ON google_drive_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_google_drive_accounts_updated_at();

-- Row Level Security
ALTER TABLE google_drive_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem sua própria conexão
CREATE POLICY "Users can view their own Google Drive connection"
  ON google_drive_accounts
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Usuários podem inserir sua própria conexão
CREATE POLICY "Users can insert their own Google Drive connection"
  ON google_drive_accounts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Usuários podem atualizar sua própria conexão
CREATE POLICY "Users can update their own Google Drive connection"
  ON google_drive_accounts
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Usuários podem deletar sua própria conexão
CREATE POLICY "Users can delete their own Google Drive connection"
  ON google_drive_accounts
  FOR DELETE
  USING (user_id = auth.uid());

-- Comentários
COMMENT ON TABLE google_drive_accounts IS 'Armazena conexões OAuth do Google Drive por usuário';
COMMENT ON COLUMN google_drive_accounts.folder_id IS 'ID da pasta "Ideias" criada automaticamente no Google Drive';
COMMENT ON COLUMN google_drive_accounts.access_token IS 'Token de acesso OAuth (atualizado periodicamente)';
COMMENT ON COLUMN google_drive_accounts.refresh_token IS 'Token de refresh OAuth (persiste mais tempo)';
COMMENT ON COLUMN ideas.drive_video_ids IS 'Array JSONB com IDs dos vídeos salvos no Google Drive para esta ideia';
COMMENT ON COLUMN ideas.drive_folder_id IS 'ID da subpasta específica desta ideia no Google Drive';
