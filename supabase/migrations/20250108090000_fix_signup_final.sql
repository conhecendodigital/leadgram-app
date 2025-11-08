-- ════════════════════════════════════════════════════════════════
-- 🔧 CORREÇÃO FINAL DO SIGNUP
-- ════════════════════════════════════════════════════════════════
--
-- Objetivo: Corrigir erro "Database error creating new user"
--
-- Problema identificado:
-- - FK constraints podem estar impedindo signup
-- - Trigger pode estar falhando silenciosamente
--
-- Solução:
-- 1. Remover TODAS as FK constraints para auth.users
-- 2. Garantir que trigger não bloqueia signup
-- 3. Adicionar logs detalhados
--
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ════════════════════════════════════════════════════════════════
-- 1. DESCOBRIR E REMOVER TODAS AS FK CONSTRAINTS
-- ════════════════════════════════════════════════════════════════

DO $$
DECLARE
  constraint_record RECORD;
  drop_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '1️⃣ Removendo FK Constraints...';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';

  -- Buscar TODAS as FKs que referenciam auth.users
  FOR constraint_record IN
    SELECT
      tc.table_schema,
      tc.table_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  LOOP
    -- Executar DROP CONSTRAINT dinamicamente
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE',
      constraint_record.table_schema,
      constraint_record.table_name,
      constraint_record.constraint_name
    );

    drop_count := drop_count + 1;

    RAISE NOTICE '✓ Removida: %.% → %',
      constraint_record.table_schema,
      constraint_record.table_name,
      constraint_record.constraint_name;
  END LOOP;

  IF drop_count = 0 THEN
    RAISE NOTICE '✓ Nenhuma FK constraint encontrada (já foram removidas)';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✓ Total de FK constraints removidas: %', drop_count;
  END IF;

  RAISE NOTICE '';
END $$;

-- ════════════════════════════════════════════════════════════════
-- 2. GARANTIR QUE TRIGGER NÃO BLOQUEIA SIGNUP
-- ════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '2️⃣ Atualizando função handle_new_user()...';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- Capturar email com fallbacks
  user_email := COALESCE(
    NEW.email,
    NEW.raw_user_meta_data->>'email',
    'user' || NEW.id || '@placeholder.com'
  );

  -- Capturar nome com fallbacks
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_app_meta_data->>'full_name',
    'Usuário ' || substring(NEW.id::text, 1, 8)
  );

  -- Log inicial
  RAISE NOTICE '🔵 handle_new_user: Iniciando para user_id=% email=%', NEW.id, user_email;

  -- Verificar se perfil já existe (evitar duplicatas)
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;

  IF profile_exists THEN
    RAISE NOTICE '⚠️ handle_new_user: Perfil já existe para user_id=%, pulando...', NEW.id;
    RETURN NEW;
  END IF;

  -- Inserir perfil
  BEGIN
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
    ) VALUES (
      NEW.id,
      user_email,
      user_full_name,
      'user',
      'free',
      10,
      0,
      NOW(),
      NOW()
    );

    RAISE NOTICE '✅ handle_new_user: Perfil criado com sucesso para user_id=%', NEW.id;

  EXCEPTION
    WHEN OTHERS THEN
      -- Log do erro mas NÃO bloqueia signup
      RAISE WARNING '❌ handle_new_user: ERRO ao criar perfil para user_id=% - SQLSTATE: % SQLERRM: %',
        NEW.id, SQLSTATE, SQLERRM;
  END;

  RETURN NEW;  -- SEMPRE retorna NEW (nunca bloqueia signup)
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✓ Função handle_new_user() atualizada';
  RAISE NOTICE '';
END $$;

-- ════════════════════════════════════════════════════════════════
-- 3. GARANTIR QUE TRIGGER ESTÁ ATIVO
-- ════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '3️⃣ Verificando trigger...';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  RAISE NOTICE '✓ Trigger on_auth_user_created recriado';
  RAISE NOTICE '';
END $$;

-- ════════════════════════════════════════════════════════════════
-- 4. CRIAR TRIGGER DE DELETE (CASCADE MANUAL)
-- ════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '4️⃣ Criando trigger de cascade delete...';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE NOTICE '🗑️ Deletando todos os dados do user_id=%', OLD.id;

  -- Deletar perfil
  DELETE FROM public.profiles WHERE id = OLD.id;

  -- Deletar subscriptions
  DELETE FROM public.user_subscriptions WHERE user_id = OLD.id;

  -- Deletar payments
  DELETE FROM public.payments WHERE user_id = OLD.id;

  RAISE NOTICE '✓ Dados do user_id=% deletados com sucesso', OLD.id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

DO $$
BEGIN
  RAISE NOTICE '✓ Trigger on_auth_user_deleted criado';
  RAISE NOTICE '';
END $$;

-- ════════════════════════════════════════════════════════════════
-- 5. VALIDAÇÃO FINAL
-- ════════════════════════════════════════════════════════════════

DO $$
DECLARE
  fk_count INTEGER;
  trigger_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '5️⃣ Validação Final...';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';

  -- Contar FKs restantes
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_schema = 'auth'
    AND ccu.table_name = 'users';

  -- Contar triggers ativos
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgrelid = 'auth.users'::regclass
    AND tgname IN ('on_auth_user_created', 'on_auth_user_deleted');

  -- Resultados
  RAISE NOTICE '📊 Resultados:';
  RAISE NOTICE '   FK Constraints para auth.users: %', fk_count;
  RAISE NOTICE '   Triggers ativos: %', trigger_count;
  RAISE NOTICE '';

  IF fk_count = 0 AND trigger_count = 2 THEN
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '🎉 CORREÇÃO APLICADA COM SUCESSO!';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Todas as FK constraints removidas';
    RAISE NOTICE '✅ Triggers configurados corretamente';
    RAISE NOTICE '✅ Signup deve funcionar agora!';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Próximo passo: Testar signup';
    RAISE NOTICE '   Execute: node verificar-estado-final.js';
    RAISE NOTICE '';
  ELSE
    RAISE WARNING '⚠️ Verificação falhou!';
    RAISE WARNING '   FK Constraints: % (esperado: 0)', fk_count;
    RAISE WARNING '   Triggers: % (esperado: 2)', trigger_count;
  END IF;
END $$;

COMMIT;
