-- =============================================
-- CONFIGURAR USUÁRIO ADMIN
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Adicionar coluna 'role' na tabela profiles se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    END IF;
END $$;

-- 2. Atualizar o usuário para role 'admin' usando o email do auth.users
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'matheussss.afiliado@gmail.com'
);

-- 3. Verificar se funcionou
SELECT
  p.id,
  u.email,
  p.role,
  p.full_name,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'matheussss.afiliado@gmail.com';

-- =============================================
-- RESULTADO ESPERADO:
-- Você deve ver uma linha com role = 'admin'
-- =============================================
