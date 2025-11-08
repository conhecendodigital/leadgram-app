-- ════════════════════════════════════════════════════════════════
-- 🧪 TESTE: Desabilitar trigger temporariamente
-- ════════════════════════════════════════════════════════════════
--
-- Objetivo: Verificar se o problema é no trigger handle_new_user()
--
-- Se signup funcionar SEM o trigger, sabemos que o problema está na função
-- Se signup NÃO funcionar SEM o trigger, o problema é em outro lugar
--
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- Desabilitar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🧪 TRIGGER DESABILITADO PARA TESTE';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Trigger on_auth_user_created removido';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Agora teste o signup em: http://localhost:3000/register';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ Se funcionar: problema está na função handle_new_user()';
  RAISE NOTICE '⚠️ Se NÃO funcionar: problema está em outro lugar';
  RAISE NOTICE '';
END $$;

COMMIT;
