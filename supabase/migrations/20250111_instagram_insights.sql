-- Tabela para armazenar snapshots diários de insights do Instagram
-- Permite criar gráficos temporais e acompanhar crescimento

CREATE TABLE IF NOT EXISTS instagram_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Métricas de alcance
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,

  -- Métricas de conta
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,

  -- Métricas de engajamento
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,

  -- Métricas de conteúdo
  posts_published INTEGER DEFAULT 0,
  stories_published INTEGER DEFAULT 0,

  -- Métricas de website
  website_clicks INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: um snapshot por dia por conta
  UNIQUE(instagram_account_id, date)
);

-- Índices para performance
CREATE INDEX idx_instagram_insights_account ON instagram_insights(instagram_account_id);
CREATE INDEX idx_instagram_insights_date ON instagram_insights(date DESC);
CREATE INDEX idx_instagram_insights_account_date ON instagram_insights(instagram_account_id, date DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_instagram_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_instagram_insights_updated_at
  BEFORE UPDATE ON instagram_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_instagram_insights_updated_at();

-- Row Level Security
ALTER TABLE instagram_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem seus próprios insights
CREATE POLICY "Users can view their own insights"
  ON instagram_insights
  FOR SELECT
  USING (
    instagram_account_id IN (
      SELECT id FROM instagram_accounts
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Sistema pode inserir insights
CREATE POLICY "System can insert insights"
  ON instagram_insights
  FOR INSERT
  WITH CHECK (
    instagram_account_id IN (
      SELECT id FROM instagram_accounts
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Sistema pode atualizar insights
CREATE POLICY "System can update insights"
  ON instagram_insights
  FOR UPDATE
  USING (
    instagram_account_id IN (
      SELECT id FROM instagram_accounts
      WHERE user_id = auth.uid()
    )
  );

-- Comentários
COMMENT ON TABLE instagram_insights IS 'Snapshots diários de métricas do Instagram para análise temporal';
COMMENT ON COLUMN instagram_insights.date IS 'Data do snapshot (um por dia)';
COMMENT ON COLUMN instagram_insights.impressions IS 'Total de visualizações de conteúdo';
COMMENT ON COLUMN instagram_insights.reach IS 'Contas únicas alcançadas';
COMMENT ON COLUMN instagram_insights.engagement_rate IS 'Taxa de engajamento em porcentagem';
