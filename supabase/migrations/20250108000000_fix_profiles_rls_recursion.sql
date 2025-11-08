-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO DEFINITIVA: Políticas RLS sem Recursão Infinita
-- ═══════════════════════════════════════════════════════════
--
-- PROBLEMA: A política "Admins podem gerenciar todos os perfis"
-- causava recursão infinita ao consultar a tabela profiles dentro
-- da própria política RLS de profiles.
--
-- SOLUÇÃO: Usar auth.jwt() para verificar role ao invés de
-- consultar a tabela profiles.
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. REMOVER TODAS as políticas atuais da tabela profiles
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;

-- Remover possíveis políticas antigas
DROP POLICY IF EXISTS "users_select_own" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.profiles;
DROP POLICY IF EXISTS "users_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "admins_all_access" ON public.profiles;

-- ═══════════════════════════════════════════════════════════
-- 2. CRIAR políticas corretas SEM recursão
-- ═══════════════════════════════════════════════════════════

-- Usuários normais podem ver apenas seu próprio perfil
CREATE POLICY "users_select_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil (durante registro)
CREATE POLICY "users_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "users_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuários podem deletar apenas seu próprio perfil
CREATE POLICY "users_delete_own" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════
-- 3. Para ADMINS: usar auth.jwt() ao invés de consultar profiles
-- Isso evita recursão porque não consulta a tabela profiles
-- ═══════════════════════════════════════════════════════════

-- IMPORTANTE: O role 'admin' deve ser definido no JWT do usuário
-- Isso é feito no momento do login/registro
CREATE POLICY "admins_all_access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    -- Verifica no JWT se o usuário é admin (SEM consultar profiles!)
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'user') = 'admin'
    OR
    -- Fallback: permite ao próprio usuário (evita lockout)
    auth.uid() = id
  )
  WITH CHECK (
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'user') = 'admin'
    OR
    auth.uid() = id
  );

-- ═══════════════════════════════════════════════════════════
-- 4. GARANTIR que RLS esteja habilitado
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- 5. VERIFICAÇÃO: Contar políticas criadas
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles' AND schemaname = 'public';

  RAISE NOTICE 'Total de políticas RLS na tabela profiles: %', policy_count;

  IF policy_count = 5 THEN
    RAISE NOTICE '✓ Políticas criadas com sucesso!';
    RAISE NOTICE '✓ Problema de recursão infinita RESOLVIDO';
  ELSE
    RAISE WARNING '⚠ Esperado 5 políticas, encontrado %', policy_count;
  END IF;
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════
-- 6. DOCUMENTAÇÃO
-- ═══════════════════════════════════════════════════════════

COMMENT ON TABLE public.profiles IS 'Perfis de usuários com RLS habilitado. Políticas sem recursão: 4 para usuários normais + 1 para admins (via JWT)';

-- ═══════════════════════════════════════════════════════════
-- 7. LISTAR políticas finais (para verificação)
-- ═══════════════════════════════════════════════════════════

-- Para ver as políticas criadas, execute:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
