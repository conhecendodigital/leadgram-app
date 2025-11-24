import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ERROR_MESSAGES } from '@/lib/constants/auth';

/**
 * Handler centralizado de erros para API routes
 * Registra erros críticos no banco de dados (que criam notificações via trigger)
 *
 * @param error - Erro capturado
 * @param context - Contexto da API onde o erro ocorreu
 * @returns NextResponse com erro formatado
 */
export async function handleApiError(error: unknown, context?: string) {
  const err = error instanceof Error ? error : new Error(String(error));

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Registrar erro crítico no banco (trigger vai criar notificação)
    await (supabase.from('error_logs') as any).insert({
      error_type: err.name || 'APIError',
      error_message: err.message,
      stack_trace: err.stack,
      url: context || 'API Route',
      user_id: user?.id,
      user_agent: 'server',
      severity: 'critical',
      metadata: {
        context,
        timestamp: new Date().toISOString()
      }
    });
  } catch (logError) {
    // Se falhar ao registrar, apenas log no console
    console.error('Falha ao registrar erro crítico:', logError);
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
