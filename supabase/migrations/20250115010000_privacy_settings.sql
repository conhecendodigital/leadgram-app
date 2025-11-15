-- ================================================
-- MIGRATION: PRIVACY SETTINGS
-- Data: 2025-01-15
-- Descrição: Adiciona colunas de privacidade na tabela profiles
-- ================================================

-- 1. Adicionar colunas de privacidade
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  ADD COLUMN IF NOT EXISTS share_analytics BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_search BOOLEAN DEFAULT false;

-- 2. Comentários
COMMENT ON COLUMN public.profiles.visibility IS 'Visibilidade do perfil: public ou private';
COMMENT ON COLUMN public.profiles.share_analytics IS 'Compartilhar análises anônimas para melhorar o produto';
COMMENT ON COLUMN public.profiles.show_in_search IS 'Permitir que o perfil apareça em buscas';

-- ================================================
-- FIM DA MIGRATION
-- ================================================
