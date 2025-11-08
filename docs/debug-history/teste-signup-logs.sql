-- ════════════════════════════════════════════════════════════════
-- 🧪 TESTE DE SIGNUP COM LOGS DETALHADOS
-- ════════════════════════════════════════════════════════════════
--
-- Este SQL simula EXATAMENTE o que o Supabase Auth faz internamente
-- e mostra qual erro está bloqueando o signup
--
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
-- 2. Cole este SQL completo
-- 3. Clique em RUN
-- 4. Me envie o output completo (especialmente a seção "ERRO")
--
-- ════════════════════════════════════════════════════════════════

DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
  test_email text := 'teste.' || extract(epoch from now())::text || '@example.com';
  profile_created boolean := false;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🧪 TESTE DE SIGNUP SIMULADO';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'User ID: %', test_user_id;
  RAISE NOTICE 'Email: %', test_email;
  RAISE NOTICE '';
  RAISE NOTICE '1️⃣ Inserindo usuário em auth.users...';
  RAISE NOTICE '';

  -- Tentar inserir usuário (EXATAMENTE como o Supabase Auth faz)
  BEGIN
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
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Teste Simulado"}'::jsonb,
      false,
      '',
      '',
      ''
    );

    RAISE NOTICE '✅ Usuário inserido em auth.users com sucesso!';
    RAISE NOTICE '';

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '';
      RAISE NOTICE '═══════════════════════════════════════════════';
      RAISE NOTICE '❌ ERRO AO INSERIR USUÁRIO!';
      RAISE NOTICE '═══════════════════════════════════════════════';
      RAISE NOTICE '';
      RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
      RAISE NOTICE 'SQLERRM: %', SQLERRM;
      RAISE NOTICE 'MESSAGE_TEXT: %', SQLERRM;
      RAISE NOTICE 'PG_EXCEPTION_DETAIL: %', PG_EXCEPTION_DETAIL;
      RAISE NOTICE 'PG_EXCEPTION_HINT: %', PG_EXCEPTION_HINT;
      RAISE NOTICE '';
      RAISE NOTICE '💡 Este é o erro que está bloqueando o signup!';
      RAISE NOTICE '';

      -- Mostrar interpretação do erro
      IF SQLSTATE = '23503' THEN
        RAISE NOTICE '🔍 Interpretação: FK constraint violation';
        RAISE NOTICE '   Alguma FK ainda existe e está bloqueando';
      ELSIF SQLSTATE = '23502' THEN
        RAISE NOTICE '🔍 Interpretação: NOT NULL constraint violation';
        RAISE NOTICE '   Campo obrigatório está faltando';
      ELSIF SQLSTATE = '42501' THEN
        RAISE NOTICE '🔍 Interpretação: Permission denied';
        RAISE NOTICE '   RLS ou permissão está bloqueando';
      ELSIF SQLSTATE LIKE 'P0%' THEN
        RAISE NOTICE '🔍 Interpretação: Erro em trigger/function';
        RAISE NOTICE '   A função handle_new_user() está falhando';
      ELSE
        RAISE NOTICE '🔍 Interpretação: Erro desconhecido';
        RAISE NOTICE '   Ver SQLERRM acima para detalhes';
      END IF;

      RAISE NOTICE '';
      RAISE NOTICE '═══════════════════════════════════════════════';

      -- Re-lançar erro para parar execução
      RAISE;
  END;

  -- Se chegou aqui, usuário foi criado com sucesso
  RAISE NOTICE '2️⃣ Verificando se perfil foi criado pelo trigger...';
  RAISE NOTICE '';

  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = test_user_id
  ) INTO profile_created;

  IF profile_created THEN
    RAISE NOTICE '✅ Perfil criado automaticamente!';

    DECLARE
      p_email text;
      p_name text;
    BEGIN
      SELECT email, full_name INTO p_email, p_name
      FROM public.profiles
      WHERE id = test_user_id;

      RAISE NOTICE '';
      RAISE NOTICE '📋 Dados do perfil:';
      RAISE NOTICE '   Email: %', p_email;
      RAISE NOTICE '   Nome: %', p_name;
    END;
  ELSE
    RAISE WARNING '❌ Perfil NÃO foi criado!';
    RAISE WARNING 'Trigger handle_new_user() não executou ou falhou';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '3️⃣ Limpando usuário de teste...';
  RAISE NOTICE '';

  -- Limpar
  DELETE FROM auth.users WHERE id = test_user_id;

  RAISE NOTICE '✅ Usuário deletado';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🎉 TESTE CONCLUÍDO COM SUCESSO!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ INSERT em auth.users: OK';
  RAISE NOTICE '✅ Trigger handle_new_user(): %', CASE WHEN profile_created THEN 'OK' ELSE 'FALHOU' END;
  RAISE NOTICE '✅ Sistema funcionando: %', CASE WHEN profile_created THEN 'SIM' ELSE 'NÃO' END;
  RAISE NOTICE '';

EXCEPTION
  WHEN OTHERS THEN
    -- Tentar limpar mesmo se houver erro
    BEGIN
      DELETE FROM auth.users WHERE id = test_user_id;
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;

    -- Não re-lançar erro aqui (já foi logado acima)
    RAISE NOTICE '';
    RAISE NOTICE '💔 TESTE FALHOU';
    RAISE NOTICE '';
END $$;
