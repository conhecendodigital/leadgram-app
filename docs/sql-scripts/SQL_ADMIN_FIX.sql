-- =============================================
-- EXECUTAR ESTE SQL NO SUPABASE AGORA!
-- =============================================

-- 1. Verificar se a coluna role existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 2. Atualizar SEU usuário para admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'matheussss.afiliado@gmail.com';

-- 3. Verificar se deu certo
SELECT id, email, role, full_name
FROM profiles
WHERE email = 'matheussss.afiliado@gmail.com';

-- 4. Criar tabelas admin se não existirem
CREATE TABLE IF NOT EXISTS admin_mercadopago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  public_key TEXT NOT NULL,
  refresh_token TEXT,
  user_id_mp TEXT,
  email TEXT,
  connection_type TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  test_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  mercadopago_subscription_id TEXT,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,
  mercadopago_payment_id TEXT,
  amount DECIMAL(10,2),
  status TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criar subscription FREE para todos usuários que não tem
INSERT INTO user_subscriptions (user_id, plan_type, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions WHERE user_subscriptions.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Habilitar RLS
ALTER TABLE admin_mercadopago ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 7. Drop policies existentes para recriar
DROP POLICY IF EXISTS "Admin can manage MP" ON admin_mercadopago;
DROP POLICY IF EXISTS "Users view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Admin view all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users view own payments" ON payments;
DROP POLICY IF EXISTS "Admin view all payments" ON payments;

-- 8. Criar policies
CREATE POLICY "Admin can manage MP" ON admin_mercadopago
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin view all subscriptions" ON user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin view all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 9. Índices
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- 10. Verificação final
SELECT
  'Admin configurado!' as status,
  email,
  role,
  (SELECT COUNT(*) FROM user_subscriptions) as total_subscriptions
FROM profiles
WHERE email = 'matheussss.afiliado@gmail.com';
