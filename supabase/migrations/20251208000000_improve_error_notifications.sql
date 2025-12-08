-- ═══════════════════════════════════════════════════════════
-- MELHORIA NAS NOTIFICAÇÕES DE ERROS
-- Mensagens mais descritivas e com contexto em português
-- ═══════════════════════════════════════════════════════════

-- Atualiza função de notificação de erros críticos com mensagens melhores
CREATE OR REPLACE FUNCTION notify_critical_error()
RETURNS TRIGGER AS $$
DECLARE
  settings_enabled BOOLEAN;
  error_title TEXT;
  error_msg TEXT;
  context_info TEXT;
BEGIN
  -- Só notifica erros críticos
  IF NEW.severity = 'critical' THEN
    -- Verificar se notificação está ativada
    SELECT notify_system_errors INTO settings_enabled
    FROM admin_notification_settings
    LIMIT 1;

    IF settings_enabled THEN
      -- Extrair contexto do metadata ou url
      context_info := COALESCE(
        NEW.metadata->>'context',
        NEW.url,
        'Sistema'
      );

      -- Definir título baseado no contexto
      error_title := CASE
        WHEN context_info ILIKE '%webhook%' OR context_info ILIKE '%mercadopago%' OR context_info ILIKE '%pagamento%' THEN
          'Erro no Processamento de Pagamento'
        WHEN context_info ILIKE '%instagram%' OR context_info ILIKE '%meta%' THEN
          'Erro na Integração com Instagram'
        WHEN context_info ILIKE '%database%' OR context_info ILIKE '%supabase%' THEN
          'Erro de Conexão com Banco de Dados'
        WHEN context_info ILIKE '%auth%' OR context_info ILIKE '%login%' THEN
          'Erro no Sistema de Autenticação'
        WHEN context_info ILIKE '%email%' OR context_info ILIKE '%resend%' THEN
          'Erro no Envio de Email'
        ELSE
          'Erro Crítico do Sistema'
      END;

      -- Formatar mensagem com contexto útil
      error_msg := CONCAT(
        'Origem: ', context_info, E'\n',
        'Tipo: ', COALESCE(NEW.error_type, 'Desconhecido'), E'\n',
        'Detalhes: ', SUBSTRING(NEW.error_message, 1, 300)
      );

      INSERT INTO admin_notifications (type, title, message, link, metadata)
      VALUES (
        'system_error',
        error_title,
        error_msg,
        '/admin/logs',
        jsonb_build_object(
          'error_id', NEW.id,
          'error_type', NEW.error_type,
          'severity', NEW.severity,
          'context', context_info,
          'timestamp', NEW.created_at
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualiza trigger
DROP TRIGGER IF EXISTS on_critical_error ON error_logs;
CREATE TRIGGER on_critical_error
  AFTER INSERT ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_critical_error();

COMMENT ON FUNCTION notify_critical_error() IS 'Cria notificação com mensagem descritiva quando um erro crítico ocorre';
