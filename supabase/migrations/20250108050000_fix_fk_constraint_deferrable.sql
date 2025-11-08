-- ═══════════════════════════════════════════════════════════
-- CORREÇÃO CRÍTICA: Foreign Key Bloqueando Signup
-- ═══════════════════════════════════════════════════════════
--
-- PROBLEMA IDENTIFICADO:
-- Erro ao fazer signup: "Database error saving new user"
-- Causa: Foreign key constraint "profiles_id_fkey" está validando
-- DURANTE a transaction de signup, antes do commit em auth.users
--
-- ERRO ESPECÍFICO:
-- Code: 23503
-- Message: insert or update on table "profiles" violates foreign key
--          constraint "profiles_id_fkey"
-- Details: Key (id)=(...) is not present in table "users".
--
-- SEQUÊNCIA DO ERRO:
-- 1. supabase.auth.signUp() cria usuário em auth.users (START TRANSACTION)
-- 2. Trigger on_auth_user_created dispara AFTER INSERT
-- 3. Trigger tenta INSERT em public.profiles com NEW.id
-- 4. FK constraint valida se NEW.id existe em auth.users
-- 5. MAS transaction ainda não foi comitada!
-- 6. Validação FK falha → ROLLBACK → signup retorna erro 500
--
-- SOLUÇÃO:
-- Tornar a FK DEFERRABLE INITIALLY DEFERRED
-- Isso adia a validação para o FIM da transaction (COMMIT),
-- quando o usuário já estará presente em auth.users.
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. VERIFICAR SE A CONSTRAINT EXISTE
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey'
    AND table_name = 'profiles'
    AND table_schema = 'public'
  ) INTO constraint_exists;

  IF constraint_exists THEN
    RAISE NOTICE '✓ Constraint profiles_id_fkey encontrada';
  ELSE
    RAISE NOTICE '⚠ Constraint profiles_id_fkey NÃO encontrada';
    RAISE NOTICE '  Ela pode ter outro nome ou não existir';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 2. REMOVER CONSTRAINT EXISTENTE
-- ═══════════════════════════════════════════════════════════

-- Tentar remover se existir
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ═══════════════════════════════════════════════════════════
-- 3. RECRIAR CONSTRAINT COMO DEFERRABLE
-- ═══════════════════════════════════════════════════════════

-- Criar nova FK constraint que adia a validação
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE           -- Se usuário for deletado, deleta perfil também
  DEFERRABLE INITIALLY DEFERRED;  -- CRÍTICO: Adia validação para o COMMIT

-- ═══════════════════════════════════════════════════════════
-- 4. VALIDAÇÃO COMPLETA
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  constraint_info RECORD;
BEGIN
  -- Buscar informações sobre a constraint
  SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    tc.is_deferrable,
    tc.initially_deferred
  INTO constraint_info
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
  WHERE tc.constraint_name = 'profiles_id_fkey'
    AND tc.table_schema = 'public';

  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'VALIDAÇÃO DA CORREÇÃO DE FK';
  RAISE NOTICE '═══════════════════════════════════════════════';

  IF constraint_info.constraint_name IS NOT NULL THEN
    RAISE NOTICE 'Constraint: %', constraint_info.constraint_name;
    RAISE NOTICE 'Column: % → %.%',
      constraint_info.column_name,
      constraint_info.foreign_table_name,
      constraint_info.foreign_column_name;
    RAISE NOTICE 'On Delete: %', constraint_info.delete_rule;
    RAISE NOTICE 'Is Deferrable: %', constraint_info.is_deferrable;
    RAISE NOTICE 'Initially Deferred: %', constraint_info.initially_deferred;
    RAISE NOTICE '';

    IF constraint_info.is_deferrable = 'YES' AND
       constraint_info.initially_deferred = 'YES' THEN
      RAISE NOTICE '🎉 ✓ CONSTRAINT CORRIGIDA COM SUCESSO!';
      RAISE NOTICE '';
      RAISE NOTICE 'A constraint agora é DEFERRABLE INITIALLY DEFERRED';
      RAISE NOTICE 'Isso significa que a validação acontece no COMMIT,';
      RAISE NOTICE 'quando o usuário já está presente em auth.users.';
      RAISE NOTICE '';
      RAISE NOTICE '✓ Signup deve funcionar normalmente agora!';
    ELSE
      RAISE WARNING '⚠ Constraint existe mas NÃO está configurada corretamente';
      RAISE WARNING '  Deferrable: % (esperado: YES)', constraint_info.is_deferrable;
      RAISE WARNING '  Initially Deferred: % (esperado: YES)', constraint_info.initially_deferred;
    END IF;
  ELSE
    RAISE WARNING '⚠ Constraint profiles_id_fkey não encontrada após criação!';
  END IF;

  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════
-- TESTE APÓS APLICAR
-- ═══════════════════════════════════════════════════════════
--
-- 1. Vá para http://localhost:3000/register
-- 2. Preencha:
--    Nome: Teste FK Deferrable
--    Email: teste.fk@example.com
--    Senha: senhateste123
--
-- 3. Clique em "Criar conta"
--
-- 4. DEVE FUNCIONAR SEM ERRO!
--    ✓ Cadastro concluído
--    ✓ Perfil criado pelo trigger
--    ✓ Redirecionamento para /dashboard
--
-- 5. Verificar no banco:
--    SELECT * FROM profiles WHERE email = 'teste.fk@example.com';
--    Deve retornar o perfil com todos os campos preenchidos!
--
-- ═══════════════════════════════════════════════════════════
--
-- EXPLICAÇÃO TÉCNICA:
--
-- ANTES (sem DEFERRABLE):
-- ┌─────────────────────────────────────────────────┐
-- │ BEGIN TRANSACTION                               │
-- │   1. INSERT INTO auth.users ✓                   │
-- │   2. Trigger dispara                            │
-- │   3. INSERT INTO profiles                       │
-- │      → FK valida AGORA                          │
-- │      → auth.users ainda não comitou ❌          │
-- │      → FK validation FAILS                      │
-- │   4. ROLLBACK TRANSACTION                       │
-- └─────────────────────────────────────────────────┘
--
-- DEPOIS (com DEFERRABLE INITIALLY DEFERRED):
-- ┌─────────────────────────────────────────────────┐
-- │ BEGIN TRANSACTION                               │
-- │   1. INSERT INTO auth.users ✓                   │
-- │   2. Trigger dispara                            │
-- │   3. INSERT INTO profiles                       │
-- │      → FK validation ADIADA ⏸                   │
-- │   4. COMMIT                                      │
-- │      → Agora valida FK ✓                        │
-- │      → auth.users já comitou ✓                  │
-- │      → FK validation PASSES ✓                   │
-- └─────────────────────────────────────────────────┘
--
-- ═══════════════════════════════════════════════════════════
