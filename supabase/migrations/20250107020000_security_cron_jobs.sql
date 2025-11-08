-- ═══════════════════════════════════════════════════════════
-- CRON JOBS AUTOMÁTICOS PARA SISTEMA DE SEGURANÇA
-- ═══════════════════════════════════════════════════════════

-- Habilitar extensão pg_cron (somente se necessário)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ═══════════════════════════════════════════════════════════
-- 1. CRON JOB: Limpar sessões expiradas
-- Executa a cada 1 hora
-- ═══════════════════════════════════════════════════════════

SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 * * * *', -- A cada hora no minuto 0
  $$SELECT cleanup_expired_sessions();$$
);

-- ═══════════════════════════════════════════════════════════
-- 2. CRON JOB: Desbloquear IPs temporariamente bloqueados
-- Executa a cada 5 minutos
-- ═══════════════════════════════════════════════════════════

SELECT cron.schedule(
  'unblock-expired-ips',
  '*/5 * * * *', -- A cada 5 minutos
  $$SELECT unblock_expired_ips();$$
);

-- ═══════════════════════════════════════════════════════════
-- 3. CRON JOB: Limpar login attempts antigos (mais de 30 dias)
-- Executa diariamente à meia-noite
-- ═══════════════════════════════════════════════════════════

SELECT cron.schedule(
  'cleanup-old-login-attempts',
  '0 0 * * *', -- Diariamente à meia-noite
  $$
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '30 days';
  $$
);

-- ═══════════════════════════════════════════════════════════
-- 4. CRON JOB: Limpar audit logs antigos (mais de 90 dias)
-- Executa semanalmente aos domingos à 1h da manhã
-- ═══════════════════════════════════════════════════════════

SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 1 * * 0', -- Domingos à 1h da manhã
  $$
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  $$
);

-- ═══════════════════════════════════════════════════════════
-- VERIFICAR CRON JOBS CRIADOS
-- ═══════════════════════════════════════════════════════════

-- Para ver os cron jobs ativos, execute:
-- SELECT * FROM cron.job;

-- Para desabilitar um cron job específico:
-- SELECT cron.unschedule('nome-do-job');

-- Para ver o log de execução dos cron jobs:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 100;

COMMENT ON EXTENSION pg_cron IS 'Extensão para agendar jobs recorrentes no PostgreSQL';
