-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO: Cadastro de Novos Usuários Bloqueado
-- ═══════════════════════════════════════════════════════════
--
-- PROBLEMA: A política RLS de INSERT está bloqueando o signup
-- porque auth.uid() é NULL durante o processo de criação do usuário.
--
-- SOLUÇÃO: Usar trigger automático para criar perfil após signup
-- (Padrão recomendado pelo Supabase)
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. GARANTIR que a política de INSERT está correta
-- ═══════════════════════════════════════════════════════════

-- Remover políticas antigas de INSERT
DROP POLICY IF EXISTS "users_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;

-- Política de INSERT: Apenas usuários autenticados podem inserir seu próprio perfil
-- OU o service role (trigger) pode inserir qualquer perfil
CREATE POLICY "users_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Permitir service role (para triggers e operações admin)
CREATE POLICY "service_role_insert" ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 2. CRIAR função de trigger para auto-criar perfil
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Tenta inserir o perfil automaticamente quando um novo usuário é criado
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o perfil já existe, ignora o erro
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não bloqueia o signup
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria automaticamente um perfil quando um novo usuário é registrado via Supabase Auth';

-- ═══════════════════════════════════════════════════════════
-- 3. CRIAR trigger na tabela auth.users
-- ═══════════════════════════════════════════════════════════

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger que executa APÓS a criação do usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- 4. VERIFICAÇÃO COMPLETA
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  insert_policy_count INTEGER;
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Verificar políticas de INSERT
  SELECT COUNT(*) INTO insert_policy_count
  FROM pg_policies
  WHERE tablename = 'profiles'
  AND schemaname = 'public'
  AND cmd = 'INSERT';

  -- Verificar se a função existe
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_new_user'
  ) INTO function_exists;

  -- Verificar se o trigger existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users'
  ) INTO trigger_exists;

  -- Relatório
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'VERIFICAÇÃO DA CORREÇÃO DE SIGNUP:';
  RAISE NOTICE '═══════════════════════════════════════════════';

  IF insert_policy_count >= 2 THEN
    RAISE NOTICE '✓ Políticas de INSERT: % encontradas', insert_policy_count;
  ELSE
    RAISE WARNING '⚠ Políticas de INSERT: apenas % encontradas (esperado: 2+)', insert_policy_count;
  END IF;

  IF function_exists THEN
    RAISE NOTICE '✓ Função handle_new_user() criada';
  ELSE
    RAISE WARNING '⚠ Função handle_new_user() NÃO foi criada!';
  END IF;

  IF trigger_exists THEN
    RAISE NOTICE '✓ Trigger on_auth_user_created ativo';
  ELSE
    RAISE WARNING '⚠ Trigger on_auth_user_created NÃO foi criado!';
  END IF;

  IF function_exists AND trigger_exists THEN
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '🎉 CADASTRO DE USUÁRIOS CORRIGIDO!';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE 'Como funciona:';
    RAISE NOTICE '1. Usuário preenche formulário de cadastro';
    RAISE NOTICE '2. Supabase Auth cria o usuário em auth.users';
    RAISE NOTICE '3. Trigger executa automaticamente';
    RAISE NOTICE '4. Perfil é criado em public.profiles';
    RAISE NOTICE '5. Usuário está pronto para usar o sistema!';
  END IF;
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════
-- TESTE MANUAL (Opcional)
-- ═══════════════════════════════════════════════════════════
--
-- Para testar se o trigger está funcionando:
--
-- 1. Vá para /register no seu app
-- 2. Cadastre um novo usuário de teste
-- 3. Verifique se não dá erro "Database error saving new user"
-- 4. Verifique se o perfil foi criado automaticamente:
--
--    SELECT * FROM profiles WHERE email = 'seu-teste@email.com';
--
-- 5. Deve retornar o perfil criado pelo trigger!
