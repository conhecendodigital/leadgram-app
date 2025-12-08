import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ERROR_MESSAGES } from '@/lib/constants/auth';

type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Determina a severidade do erro baseado no tipo
 */
function determineSeverity(error: Error, context?: string): ErrorSeverity {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Erros de validação = warning (não precisa notificar admin)
  if (
    message.includes('validat') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('obrigatório') ||
    message.includes('inválido') ||
    name.includes('validation')
  ) {
    return 'warning';
  }

  // Erros de autenticação = warning
  if (
    message.includes('unauthorized') ||
    message.includes('não autorizado') ||
    message.includes('authentication') ||
    message.includes('autenticação') ||
    message.includes('token') ||
    message.includes('expired') ||
    message.includes('expirado')
  ) {
    return 'warning';
  }

  // Erros de não encontrado = info
  if (
    message.includes('not found') ||
    message.includes('não encontrado') ||
    message.includes('does not exist') ||
    message.includes('não existe')
  ) {
    return 'info';
  }

  // Erros de rate limit = warning
  if (
    message.includes('rate limit') ||
    message.includes('too many') ||
    message.includes('muitas tentativas')
  ) {
    return 'warning';
  }

  // Erros de banco de dados = critical
  if (
    message.includes('database') ||
    message.includes('banco de dados') ||
    message.includes('connection') ||
    message.includes('conexão') ||
    message.includes('timeout') ||
    message.includes('deadlock') ||
    name.includes('postgres') ||
    name.includes('supabase')
  ) {
    return 'critical';
  }

  // Erros de pagamento = critical
  if (
    context?.toLowerCase().includes('payment') ||
    context?.toLowerCase().includes('pagamento') ||
    context?.toLowerCase().includes('webhook') ||
    context?.toLowerCase().includes('mercadopago') ||
    message.includes('payment') ||
    message.includes('pagamento')
  ) {
    return 'critical';
  }

  // Erros de sistema/servidor = error (notifica, mas não é crítico)
  return 'error';
}

/**
 * Handler centralizado de erros para API routes
 * Registra erros no banco de dados com severidade apropriada
 * Apenas erros 'critical' e 'error' criam notificações para o admin
 *
 * @param error - Erro capturado
 * @param context - Contexto da API onde o erro ocorreu
 * @param forceSeverity - Força uma severidade específica (opcional)
 * @returns NextResponse com erro formatado
 */
export async function handleApiError(
  error: unknown,
  context?: string,
  forceSeverity?: ErrorSeverity
) {
  const err = error instanceof Error ? error : new Error(String(error));
  const severity = forceSeverity || determineSeverity(err, context);

  // Só registra no banco erros que são 'error' ou 'critical'
  // Warnings e infos são apenas logados no console
  if (severity === 'error' || severity === 'critical') {
    try {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      await (supabase.from('error_logs') as any).insert({
        error_type: err.name || 'APIError',
        error_message: err.message,
        stack_trace: err.stack?.substring(0, 2000), // Limita stack trace
        url: context || 'API Route',
        user_id: user?.id,
        user_agent: 'server',
        severity,
        metadata: {
          context,
          timestamp: new Date().toISOString(),
          originalName: err.name
        }
      });

      console.error(`[${severity.toUpperCase()}] ${context || 'API'}:`, err.message);
    } catch (logError) {
      console.error('Falha ao registrar erro:', logError);
    }
  } else {
    // Para warnings e infos, apenas log no console
    console.warn(`[${severity.toUpperCase()}] ${context || 'API'}:`, err.message);
  }

  // Retornar resposta de erro para o cliente
  return NextResponse.json(
    {
      error: process.env.NODE_ENV === 'development' ? err.message : ERROR_MESSAGES.SERVER_ERROR,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    { status: 500 }
  );
}

/**
 * Helper para registrar erro sem retornar resposta (para uso em webhooks)
 */
export async function logError(
  error: unknown,
  context?: string,
  forceSeverity?: ErrorSeverity
) {
  const err = error instanceof Error ? error : new Error(String(error));
  const severity = forceSeverity || determineSeverity(err, context);

  if (severity === 'error' || severity === 'critical') {
    try {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      await (supabase.from('error_logs') as any).insert({
        error_type: err.name || 'Error',
        error_message: err.message,
        stack_trace: err.stack?.substring(0, 2000),
        url: context || 'Unknown',
        user_id: user?.id,
        user_agent: 'server',
        severity,
        metadata: {
          context,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('Falha ao registrar erro:', logError);
    }
  }

  console.error(`[${severity.toUpperCase()}] ${context || 'System'}:`, err.message);
}

/**
 * Helper functions para respostas de erro padronizadas
 */
export function badRequest(message: string = ERROR_MESSAGES.EMAIL_REQUIRED) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message: string = 'Acesso negado') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message: string = 'Recurso não encontrado') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message: string = 'Conflito') {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function tooManyRequests(message: string = ERROR_MESSAGES.TOO_MANY_REQUESTS) {
  return NextResponse.json({ error: message }, { status: 429 });
}

export function serverError(message: string = ERROR_MESSAGES.SERVER_ERROR) {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Helper para respostas de sucesso padronizadas
 */
export function success<T = any>(data?: T, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    ...(data && { data })
  });
}

/**
 * Wrapper para try-catch em API routes
 * Uso: await withErrorHandling(async () => { ... }, 'Context Name')
 */
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  context?: string
): Promise<T | NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error, context);
  }
}
