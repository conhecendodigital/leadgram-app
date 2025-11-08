-- ════════════════════════════════════════════════════════════════
-- 🔧 REATIVAR TRIGGER
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger on_auth_user_created reativado';
END $$;

COMMIT;
