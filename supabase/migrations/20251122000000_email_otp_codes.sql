-- =====================================================
-- Email OTP (One-Time Password) System
-- =====================================================
-- Sistema de códigos de 6 dígitos para verificação de email
-- Substitui os magic links para evitar problemas de rate-limit

-- Tabela de códigos OTP
CREATE TABLE IF NOT EXISTS public.email_otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL, -- Código de 6 dígitos
  purpose TEXT NOT NULL, -- 'email_verification' ou 'password_reset'
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0, -- Contador de tentativas
  max_attempts INTEGER DEFAULT 5, -- Máximo de tentativas
  expires_at TIMESTAMPTZ NOT NULL, -- Quando o código expira
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,

  -- Índices para performance
  CONSTRAINT unique_active_code UNIQUE (email, purpose, code)
);

-- Índices
CREATE INDEX idx_email_otp_codes_email ON public.email_otp_codes(email);
CREATE INDEX idx_email_otp_codes_user_id ON public.email_otp_codes(user_id);
CREATE INDEX idx_email_otp_codes_code ON public.email_otp_codes(code);
CREATE INDEX idx_email_otp_codes_expires_at ON public.email_otp_codes(expires_at);
CREATE INDEX idx_email_otp_codes_purpose ON public.email_otp_codes(purpose);

-- RLS Policies
ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- Apenas service role pode inserir/atualizar/deletar
CREATE POLICY "Service role can manage OTP codes"
  ON public.email_otp_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Usuários podem ler apenas seus próprios códigos (para verificação)
CREATE POLICY "Users can read own OTP codes"
  ON public.email_otp_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- Função para limpar códigos expirados (cron job)
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_otp_codes
  WHERE expires_at < NOW()
    OR (verified = true AND verified_at < NOW() - INTERVAL '7 days');
END;
$$;

-- Comentários
COMMENT ON TABLE public.email_otp_codes IS 'Códigos OTP de 6 dígitos para verificação de email e reset de senha';
COMMENT ON COLUMN public.email_otp_codes.code IS 'Código de 6 dígitos numéricos';
COMMENT ON COLUMN public.email_otp_codes.purpose IS 'email_verification ou password_reset';
COMMENT ON COLUMN public.email_otp_codes.attempts IS 'Número de tentativas de verificação';
COMMENT ON COLUMN public.email_otp_codes.max_attempts IS 'Máximo de tentativas permitidas (padrão: 5)';
COMMENT ON COLUMN public.email_otp_codes.expires_at IS 'Timestamp de expiração do código';
