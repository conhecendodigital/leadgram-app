-- ================================================
-- MIGRATION: NOTIFICATION PREFERENCES
-- Data: 2025-01-15
-- Descrição: Cria tabela de preferências de notificações
-- ================================================

-- 1. Criar tabela de preferências de notificações
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Canais de notificação
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,

  -- Tipos de notificação
  content_ideas BOOLEAN DEFAULT true,
  goal_achievements BOOLEAN DEFAULT true,
  instagram_sync BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT false,

  -- Frequência
  frequency TEXT DEFAULT 'instant' CHECK (frequency IN ('instant', 'daily', 'weekly')),

  -- Horário silencioso
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
  ON public.notification_preferences(user_id);

-- 3. Habilitar RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- 6. Comentários
COMMENT ON TABLE public.notification_preferences IS 'Preferências de notificações dos usuários';
COMMENT ON COLUMN public.notification_preferences.user_id IS 'ID do usuário';
COMMENT ON COLUMN public.notification_preferences.email_enabled IS 'Receber notificações por email';
COMMENT ON COLUMN public.notification_preferences.push_enabled IS 'Receber notificações push';
COMMENT ON COLUMN public.notification_preferences.frequency IS 'Frequência das notificações: instant, daily, weekly';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_enabled IS 'Ativar horário silencioso';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_start IS 'Início do horário silencioso';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_end IS 'Fim do horário silencioso';

-- ================================================
-- FIM DA MIGRATION
-- ================================================
