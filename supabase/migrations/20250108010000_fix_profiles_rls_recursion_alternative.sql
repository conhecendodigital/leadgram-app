-- ═══════════════════════════════════════════════════════════
-- ALTERNATIVA SIMPLES: Políticas RLS sem Recursão
-- ═══════════════════════════════════════════════════════════
--
-- ⚠️ USE ESTA MIGRATION APENAS se a migration anterior
--    (20250108000000_fix_profiles_rls_recursion.sql) NÃO funcionar.
--
-- Esta abordagem é MAIS SIMPLES mas MENOS segura:
-- - Remove completamente a verificação de role no banco
-- - Delega verificação de admin para o código da aplicação
-- - Permite acesso total a usuários autenticados
--
-- IMPORTANTE: A segurança de admin será feita no middleware
-- da aplicação, não no banco de dados.
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. REMOVER políticas problemáticas que causam recursão
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "admins_all_access" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;

-- ═══════════════════════════════════════════════════════════
-- 2. CRIAR política simplificada para autenticados
-- ═══════════════════════════════════════════════════════════

-- Política SIMPLES: Usuários autenticados podem gerenciar seus próprios perfis
-- E o service role pode gerenciar todos (para operações admin via API)
CREATE POLICY "authenticated_users_access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para service role (operações admin via backend)
CREATE POLICY "service_role_full_access" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 3. VERIFICAÇÃO
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles' AND schemaname = 'public';

  RAISE NOTICE 'Total de políticas RLS na tabela profiles: %', policy_count;
  RAISE NOTICE '⚠ AVISO: Segurança de admin delegada ao código da aplicação';
  RAISE NOTICE '✓ Recursão infinita resolvida com abordagem simplificada';
END $$;

COMMIT;

COMMENT ON TABLE public.profiles IS 'Perfis com RLS simplificado. Segurança de admin no código da aplicação.';
