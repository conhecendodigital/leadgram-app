import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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
      error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    { status: 500 }
  );
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
