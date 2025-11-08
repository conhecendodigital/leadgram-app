
-- ════════════════════════════════════════════════════════════════
-- 🔍 QUERIES PARA DESCOBRIR CONSTRAINTS EXATAS
-- ════════════════════════════════════════════════════════════════
--
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
-- 2. Execute cada query abaixo SEPARADAMENTE
-- 3. Copie os resultados e me envie
--
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- QUERY 1: Constraints da tabela profiles
-- ════════════════════════════════════════════════════════════════


      SELECT
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public.profiles'::regclass
    ;

-- ════════════════════════════════════════════════════════════════
-- QUERY 2: Todas as Foreign Keys que referenciam users
-- ════════════════════════════════════════════════════════════════


      SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (
          ccu.table_name = 'users'
          OR tc.table_name IN ('profiles', 'user_subscriptions', 'payments')
        )
      ORDER BY tc.table_name, tc.constraint_name
    ;

-- ════════════════════════════════════════════════════════════════
-- QUERY 3: Todas as Foreign Keys do schema public (detalhado)
-- ════════════════════════════════════════════════════════════════


      SELECT
        conrelid::regclass AS table_name,
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE contype = 'f'
        AND connamespace = 'public'::regnamespace
      ORDER BY table_name
    ;

-- ════════════════════════════════════════════════════════════════
-- ✅ EXECUTE CADA QUERY E ME ENVIE OS RESULTADOS!
-- ════════════════════════════════════════════════════════════════
