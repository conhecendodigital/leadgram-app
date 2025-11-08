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
$$