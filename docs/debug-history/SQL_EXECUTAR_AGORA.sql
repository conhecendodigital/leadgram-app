-- ════════════════════════════════════════════════════════════════
-- 🔧 SOLUÇÃO DEFINITIVA: Remover FK Constraints
-- ════════════════════════════════════════════════════════════════
--
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/tgblybswivkktbehkblu/sql/new
-- 2. Cole ESTE SQL completo
-- 3. Clique em RUN
-- 4. Verifique se aparece "Success. No rows returned"
--
-- ════════════════════════════════════════════════════════════════

-- Remover FK de profiles
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- Remover FK de user_subscriptions
ALTER TABLE public.user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey CASCADE;

-- Remover FK de payments
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_user_id_fkey CASCADE;

-- ════════════════════════════════════════════════════════════════
-- ✅ PRONTO! Agora teste o cadastro em:
--    http://localhost:3000/register
-- ════════════════════════════════════════════════════════════════
