-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO COMPLETA: Trigger e Políticas RLS da tabela profiles
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. CRIAR FUNÇÃO DO TRIGGER (se não existir)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Atualiza automaticamente a coluna updated_at quando um registro é modificado';

-- ═══════════════════════════════════════════════════════════
-- 2. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES (duplicadas)
-- ═══════════════════════════════════════════════════════════

-- Políticas em INGLÊS (remover)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Políticas em PORTUGUÊS antigas (remover para recriar)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON public.profiles;

-- ═══════════════════════════════════════════════════════════
-- 3. CRIAR POLÍTICAS RLS CORRETAS E CONSOLIDADAS
-- ═══════════════════════════════════════════════════════════

-- Política 1: Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política 2: Usuários podem inserir seu próprio perfil
CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política 3: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política 4: Admins podem fazer TUDO com TODOS os perfis
CREATE POLICY "Admins podem gerenciar todos os perfis"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- 4. GARANTIR QUE RLS ESTEJA HABILITADO
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- 5. GARANTIR QUE O TRIGGER ESTEJA ATIVO
-- ═══════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- VALIDAÇÃO
-- ═══════════════════════════════════════════════════════════

-- Verificar políticas criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles' AND schemaname = 'public';

  RAISE NOTICE 'Total de políticas RLS na tabela profiles: %', policy_count;

  IF policy_count != 4 THEN
    RAISE WARNING 'Esperado 4 políticas, encontrado %', policy_count;
  END IF;
END $$;

-- Verificar se a função existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'update_updated_at_column'
  ) THEN
    RAISE EXCEPTION 'Função update_updated_at_column não foi criada!';
  END IF;

  RAISE NOTICE 'Função update_updated_at_column existe ✓';
END $$;

-- Verificar se o trigger existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_profiles_updated_at'
    AND event_object_table = 'profiles'
  ) THEN
    RAISE EXCEPTION 'Trigger update_profiles_updated_at não foi criado!';
  END IF;

  RAISE NOTICE 'Trigger update_profiles_updated_at existe ✓';
END $$;

COMMENT ON TABLE public.profiles IS 'Perfis dos usuários com informações adicionais. RLS habilitado com 4 políticas: SELECT, INSERT, UPDATE para próprio usuário + ALL para admins';
