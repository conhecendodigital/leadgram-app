-- ================================================
-- MIGRATION: USER NOTIFICATIONS SYSTEM
-- Data: 2025-01-13
-- Descrição: Cria tabela de notificações para usuários
-- ================================================

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('content_idea', 'goal_achievement', 'instagram_sync', 'system_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB,
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança (RLS Policies)

-- Usuários podem ver apenas suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem atualizar (marcar como lida) apenas suas próprias notificações
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias notificações
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Permitir que o sistema crie notificações para qualquer usuário (service_role)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- 5. Comentários na tabela e colunas
COMMENT ON TABLE public.notifications IS 'Notificações do sistema para usuários';
COMMENT ON COLUMN public.notifications.id IS 'ID único da notificação';
COMMENT ON COLUMN public.notifications.user_id IS 'ID do usuário que receberá a notificação';
COMMENT ON COLUMN public.notifications.type IS 'Tipo da notificação: content_idea, goal_achievement, instagram_sync, system_update';
COMMENT ON COLUMN public.notifications.title IS 'Título da notificação';
COMMENT ON COLUMN public.notifications.message IS 'Mensagem detalhada da notificação';
COMMENT ON COLUMN public.notifications.read IS 'Se a notificação foi lida pelo usuário';
COMMENT ON COLUMN public.notifications.created_at IS 'Data e hora de criação da notificação';
COMMENT ON COLUMN public.notifications.metadata IS 'Dados adicionais em formato JSON';

-- ================================================
-- FIM DA MIGRATION
-- ================================================
