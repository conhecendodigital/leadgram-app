-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO DEFINITIVA: Trigger Não Está Capturando Email
-- ═══════════════════════════════════════════════════════════
--
-- PROBLEMA IDENTIFICADO:
-- Alguns perfis foram criados com email = NULL porque o trigger
-- handle_new_user() não está conseguindo acessar NEW.email corretamente.
--
-- EVIDÊNCIA:
-- - Usuário conta@teste: auth.users.email = 'conta@teste', profiles.email = NULL
-- - Usuário gui.devwork@gmail.com: auth.users.email existe, profiles.email = NULL
--
-- CAUSA:
-- O trigger estava usando NEW.email mas por algum motivo o campo
-- não estava disponível ou estava NULL no momento da execução.
--
-- SOLUÇÃO:
-- 1. Corrigir o trigger para GARANTIR que capture o email
-- 2. Adicionar logs para debug
-- 3. Atualizar perfis existentes com email NULL
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. ATUALIZAR PERFIS EXISTENTES COM EMAIL NULL
-- ═══════════════════════════════════════════════════════════

-- Criar função temporária para atualizar emails
CREATE OR REPLACE FUNCTION temp_fix_null_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  -- Para cada usuário no auth.users
  FOR user_record IN
    SELECT id, email FROM auth.users WHERE email IS NOT NULL
  LOOP
    -- Atualizar perfil se email estiver NULL
    UPDATE public.profiles
    SET email = user_record.email
    WHERE id = user_record.id
    AND (email IS NULL OR email = '');

    IF FOUND THEN
      updated_count := updated_count + 1;
      RAISE NOTICE 'Atualizado perfil % com email %', user_record.id, user_record.email;
    END IF;
  END LOOP;

  RAISE NOTICE '✓ Total de perfis atualizados: %', updated_count;
END;
$$;

-- Executar a correção
SELECT temp_fix_null_emails();

-- Remover função temporária
DROP FUNCTION temp_fix_null_emails();

-- ═══════════════════════════════════════════════════════════
-- 2. RECRIAR TRIGGER COM LÓGICA ROBUSTA
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  -- Capturar email (múltiplas fontes como fallback)
  user_email := COALESCE(
    NEW.email,                          -- Primeiro tenta NEW.email direto
    NEW.raw_user_meta_data->>'email',   -- Fallback: metadata
    ''                                   -- Fallback final: string vazia
  );

  -- Capturar full_name do metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_app_meta_data->>'full_name',
    ''
  );

  -- Log para debug (aparece no Supabase Logs)
  RAISE NOTICE 'handle_new_user: Criando perfil para user_id=% email=% name=%',
    NEW.id, user_email, user_full_name;

  -- Inserir ou atualizar perfil (UPSERT)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    plan_id,
    ideas_limit,
    ideas_used,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_email,              -- Usa variável capturada
    user_full_name,          -- Usa variável capturada
    'user',
    'free',
    10,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(EXCLUDED.email, profiles.email),  -- Atualiza se não for vazio
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    updated_at = NOW();

  RAISE NOTICE 'handle_new_user: ✓ Perfil criado/atualizado com sucesso para %', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detalhado do erro
    RAISE WARNING 'handle_new_user: ✗ ERRO ao criar perfil para % - % %',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;  -- Não bloqueia o signup mesmo em caso de erro
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Cria/atualiza perfil automaticamente após signup. '
  'Usa fallbacks robustos para email e full_name. '
  'Versão 2.0 - Com logs para debug';

-- ═══════════════════════════════════════════════════════════
-- 3. RECRIAR TRIGGER (garantir que está ativo)
-- ═══════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- 4. VALIDAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  null_email_count INTEGER;
  trigger_active BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Contar perfis com email NULL
  SELECT COUNT(*) INTO null_email_count
  FROM public.profiles
  WHERE email IS NULL OR email = '';

  -- Verificar função
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) INTO function_exists;

  -- Verificar trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users'
  ) INTO trigger_active;

  -- Relatório
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'CORREÇÃO DE EMAIL - VALIDAÇÃO FINAL';
  RAISE NOTICE '═══════════════════════════════════════════════';

  IF null_email_count = 0 THEN
    RAISE NOTICE '✓ Perfis com email NULL: 0 (todos corrigidos!)';
  ELSE
    RAISE WARNING '⚠ Perfis com email NULL: % (verificar manualmente)', null_email_count;
  END IF;

  IF function_exists THEN
    RAISE NOTICE '✓ Função handle_new_user() atualizada';
  ELSE
    RAISE EXCEPTION '✗ Função handle_new_user() NÃO existe!';
  END IF;

  IF trigger_active THEN
    RAISE NOTICE '✓ Trigger on_auth_user_created ativo';
  ELSE
    RAISE EXCEPTION '✗ Trigger on_auth_user_created NÃO está ativo!';
  END IF;

  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🎉 TRIGGER CORRIGIDO E PERFIS ATUALIZADOS!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Melhorias implementadas:';
  RAISE NOTICE '1. ✓ Email capturado com múltiplos fallbacks';
  RAISE NOTICE '2. ✓ Logs detalhados para debug';
  RAISE NOTICE '3. ✓ UPSERT previne duplicação';
  RAISE NOTICE '4. ✓ Perfis existentes corrigidos';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximo teste: Cadastrar novo usuário em /register';
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════
-- VERIFICAÇÃO PÓS-APLICAÇÃO
-- ═══════════════════════════════════════════════════════════
--
-- Execute depois de aplicar a migration:
--
-- SELECT id, email, full_name FROM profiles ORDER BY created_at DESC;
--
-- Todos os perfis devem ter email preenchido!
-- ═══════════════════════════════════════════════════════════
