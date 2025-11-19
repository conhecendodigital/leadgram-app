-- Migration: Fix OAuth States RLS Policies
-- Adiciona políticas de INSERT e UPDATE que estavam faltando
-- Data: 2025-11-19

-- Política para INSERT: Usuários podem criar seus próprios states
CREATE POLICY "Users can insert own oauth states"
  ON oauth_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Política para UPDATE: Usuários podem atualizar seus próprios states
CREATE POLICY "Users can update own oauth states"
  ON oauth_states
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Política para DELETE: Usuários podem deletar seus próprios states
CREATE POLICY "Users can delete own oauth states"
  ON oauth_states
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Atualizar a política de SELECT para incluir states sem user_id
DROP POLICY IF EXISTS "Users can view own oauth states" ON oauth_states;

CREATE POLICY "Users can view own oauth states"
  ON oauth_states
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Comentários
COMMENT ON POLICY "Users can insert own oauth states" ON oauth_states IS 'Permite usuários criar states para OAuth';
COMMENT ON POLICY "Users can update own oauth states" ON oauth_states IS 'Permite usuários marcar states como usados';
COMMENT ON POLICY "Users can delete own oauth states" ON oauth_states IS 'Permite usuários limpar seus states';
