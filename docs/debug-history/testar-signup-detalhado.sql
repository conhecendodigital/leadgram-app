-- ════════════════════════════════════════════════════════════════
-- 🧪 TESTE DE SIGNUP COM LOGS DETALHADOS
-- ════════════════════════════════════════════════════════════════
--
-- INSTRUÇÕES:
-- 1. Execute este SQL no Dashboard do Supabase
-- 2. Veja os erros detalhados no output
-- 3. Me envie os resultados
--
-- ════════════════════════════════════════════════════════════════

-- 1. Ver a função handle_new_user() atual
SELECT pg_get_functiondef('public.handle_new_user()'::regprocedure);

-- 2. Ver os triggers ativos em auth.users
SELECT
  tgname as trigger_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND tgname LIKE '%auth_user%';

-- 3. Ver estrutura da tabela profiles
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Tentar criar usuário de teste diretamente
-- (simula o que o Supabase Auth faz internamente)
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
  test_email text := 'teste.' || extract(epoch from now())::text || '@example.com';
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🧪 TESTE DE SIGNUP SIMULADO';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '1️⃣ Criando usuário em auth.users...';
  RAISE NOTICE 'ID: %', test_user_id;
  RAISE NOTICE 'Email: %', test_email;
  RAISE NOTICE '';

  -- Tentar inserir usuário
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    test_email,
    crypt('senha123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Teste Simulado"}',
    false,
    '',
    '',
    ''
  );

  RAISE NOTICE '✅ Usuário criado com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '2️⃣ Verificando se perfil foi criado...';

  -- Verificar se perfil foi criado pelo trigger
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) THEN
    RAISE NOTICE '✅ Perfil criado automaticamente pelo trigger!';

    -- Mostrar dados do perfil
    DECLARE
      profile_email text;
      profile_name text;
    BEGIN
      SELECT email, full_name INTO profile_email, profile_name
      FROM public.profiles
      WHERE id = test_user_id;

      RAISE NOTICE '';
      RAISE NOTICE '📋 Dados do perfil:';
      RAISE NOTICE '   Email: %', profile_email;
      RAISE NOTICE '   Nome: %', profile_name;
    END;
  ELSE
    RAISE WARNING '❌ Perfil NÃO foi criado! Trigger falhou!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '3️⃣ Limpando dados de teste...';

  -- Limpar
  DELETE FROM auth.users WHERE id = test_user_id;

  RAISE NOTICE '✅ Dados de teste removidos';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🎉 TESTE CONCLUÍDO!';
  RAISE NOTICE '═══════════════════════════════════════════════';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '❌ ERRO ENCONTRADO!';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    RAISE NOTICE 'SQLERRM: %', SQLERRM;
    RAISE NOTICE '';
    RAISE NOTICE '💡 Este é o erro que está impedindo o signup!';
    RAISE NOTICE '';
    RAISE NOTICE 'Detalhes:';
    RAISE NOTICE '  - Se erro de FK: Alguma constraint ainda existe';
    RAISE NOTICE '  - Se erro de NULL: Trigger não está preenchendo campo';
    RAISE NOTICE '  - Se erro de permissão: RLS está bloqueando';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';

    -- Tentar limpar mesmo com erro
    BEGIN
      DELETE FROM auth.users WHERE id = test_user_id;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorar erro de limpeza
        NULL;
    END;

    -- Re-lançar erro
    RAISE;
END $$;
