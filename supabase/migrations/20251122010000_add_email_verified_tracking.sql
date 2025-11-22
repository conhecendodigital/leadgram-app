-- =====================================================
-- Email Verification Tracking
-- =====================================================
-- Adiciona campo para rastrear verificação de email via OTP
-- Não podemos confiar em auth.users.email_confirmed_at quando
-- "Confirm Email" está desabilitado no Supabase

-- Adicionar campo email_verified_at na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Comentário
COMMENT ON COLUMN public.profiles.email_verified_at IS 'Timestamp de quando o email foi verificado via código OTP de 6 dígitos';

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified_at ON public.profiles(email_verified_at);
