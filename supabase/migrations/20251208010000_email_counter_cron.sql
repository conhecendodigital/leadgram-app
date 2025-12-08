-- ═══════════════════════════════════════════════════════════
-- CRON JOB PARA RESET DO CONTADOR DE EMAILS
-- Garante reset diário à meia-noite (horário de Brasília)
-- ═══════════════════════════════════════════════════════════

-- Habilitar extensão pg_cron se não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover job antigo se existir
SELECT cron.unschedule('reset-email-counter')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reset-email-counter');

-- Criar job para reset diário à meia-noite (horário de Brasília = 03:00 UTC)
SELECT cron.schedule(
  'reset-email-counter',
  '0 3 * * *',  -- 03:00 UTC = 00:00 BRT
  $$SELECT reset_daily_email_count()$$
);

-- Comentário
COMMENT ON EXTENSION pg_cron IS 'Agendador de tarefas para PostgreSQL - usado para reset diário do contador de emails';
