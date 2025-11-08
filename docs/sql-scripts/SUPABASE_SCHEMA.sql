-- =============================================
-- LEADGRAM - Schema do Supabase
-- =============================================
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Criar enums
CREATE TYPE idea_status AS ENUM ('idea', 'recorded', 'posted');
CREATE TYPE funnel_stage AS ENUM ('top', 'middle', 'bottom');
CREATE TYPE platform AS ENUM ('instagram', 'tiktok', 'youtube', 'facebook');
CREATE TYPE metric_source AS ENUM ('manual', 'instagram_api');

-- =============================================
-- Tabela: profiles
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- Tabela: ideas
-- =============================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT,
  script TEXT,
  editor_instructions TEXT,
  status idea_status DEFAULT 'idea',
  funnel_stage funnel_stage NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ
);

-- Índices para ideas
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_funnel_stage ON ideas(funnel_stage);

-- RLS para ideas
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ideas"
  ON ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ideas"
  ON ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON ideas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas"
  ON ideas FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Tabela: idea_platforms
-- =============================================
CREATE TABLE idea_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  platform platform NOT NULL,
  platform_post_id TEXT,
  post_url TEXT,
  posted_at TIMESTAMPTZ,
  is_posted BOOLEAN DEFAULT FALSE
);

-- Índices para idea_platforms
CREATE INDEX idx_idea_platforms_idea_id ON idea_platforms(idea_id);
CREATE INDEX idx_idea_platforms_platform ON idea_platforms(platform);

-- RLS para idea_platforms
ALTER TABLE idea_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view platforms of own ideas"
  ON idea_platforms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = idea_platforms.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create platforms for own ideas"
  ON idea_platforms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = idea_platforms.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update platforms of own ideas"
  ON idea_platforms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = idea_platforms.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete platforms of own ideas"
  ON idea_platforms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = idea_platforms.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

-- =============================================
-- Tabela: metrics
-- =============================================
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_platform_id UUID NOT NULL REFERENCES idea_platforms(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  source metric_source DEFAULT 'manual'
);

-- Índices para metrics
CREATE INDEX idx_metrics_idea_platform_id ON metrics(idea_platform_id);
CREATE INDEX idx_metrics_recorded_at ON metrics(recorded_at);

-- RLS para metrics
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics of own ideas"
  ON metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM idea_platforms
      JOIN ideas ON ideas.id = idea_platforms.idea_id
      WHERE idea_platforms.id = metrics.idea_platform_id
      AND ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create metrics for own ideas"
  ON metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM idea_platforms
      JOIN ideas ON ideas.id = idea_platforms.idea_id
      WHERE idea_platforms.id = metrics.idea_platform_id
      AND ideas.user_id = auth.uid()
    )
  );

-- =============================================
-- Tabela: instagram_accounts
-- =============================================
CREATE TABLE instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  account_type TEXT,
  followers_count INTEGER DEFAULT 0,
  follows_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  profile_picture_url TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Índices para instagram_accounts
CREATE INDEX idx_instagram_accounts_user_id ON instagram_accounts(user_id);
CREATE INDEX idx_instagram_accounts_instagram_user_id ON instagram_accounts(instagram_user_id);

-- RLS para instagram_accounts
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Instagram accounts"
  ON instagram_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own Instagram accounts"
  ON instagram_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Instagram accounts"
  ON instagram_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- Tabela: instagram_posts
-- =============================================
CREATE TABLE instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  instagram_media_id TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL,
  caption TEXT,
  permalink TEXT NOT NULL,
  thumbnail_url TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  like_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  saved INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para instagram_posts
CREATE INDEX idx_instagram_posts_account_id ON instagram_posts(instagram_account_id);
CREATE INDEX idx_instagram_posts_media_id ON instagram_posts(instagram_media_id);
CREATE INDEX idx_instagram_posts_timestamp ON instagram_posts(timestamp);

-- RLS para instagram_posts
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view posts from own Instagram accounts"
  ON instagram_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = instagram_posts.instagram_account_id
      AND instagram_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create posts for own Instagram accounts"
  ON instagram_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = instagram_posts.instagram_account_id
      AND instagram_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update posts from own Instagram accounts"
  ON instagram_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = instagram_posts.instagram_account_id
      AND instagram_accounts.user_id = auth.uid()
    )
  );

-- =============================================
-- Triggers
-- =============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Função para criar perfil automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando novo usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- CONFIGURAÇÃO COMPLETA!
-- =============================================
-- Próximos passos:
-- 1. Configure as variáveis de ambiente no .env.local
-- 2. Configure Instagram App no Meta Developers
-- 3. Execute: npm run dev
-- =============================================
