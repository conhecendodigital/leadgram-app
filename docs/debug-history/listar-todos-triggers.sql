-- ════════════════════════════════════════════════════════════════
-- 🔍 LISTAR TODOS OS TRIGGERS EM auth.users
-- ════════════════════════════════════════════════════════════════
--
-- INSTRUÇÕES:
-- 1. Execute este SQL no Dashboard
-- 2. Me envie TODO o output
--
-- ════════════════════════════════════════════════════════════════

-- 1. Listar TODOS os triggers
SELECT
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  CASE t.tgtype & 1
    WHEN 1 THEN 'ROW'
    ELSE 'STATEMENT'
  END as trigger_level,
  CASE t.tgtype & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as trigger_timing,
  CASE
    WHEN t.tgtype & 4 != 0 THEN 'INSERT'
    WHEN t.tgtype & 8 != 0 THEN 'DELETE'
    WHEN t.tgtype & 16 != 0 THEN 'UPDATE'
    WHEN t.tgtype & 32 != 0 THEN 'TRUNCATE'
    ELSE 'UNKNOWN'
  END as trigger_event,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
WHERE t.tgrelid = 'auth.users'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 2. Listar todas as constraints
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass
ORDER BY conname;

-- 3. Listar RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'auth'
  AND tablename = 'users'
ORDER BY policyname;
