import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from './rate-limit'

/**
 * Middleware para aplicar rate limiting em rotas de API
 * Retorna erro 429 se limite for excedido
 */
export async function withRateLimit(
  request: NextRequest,
  identifier: string,
  limit: number,
  window: number = 60,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const result = await rateLimiter.check(identifier, limit, window)

  // Adiciona headers de rate limit na resposta
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }

  // Se excedeu o limite, retorna 429
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Você excedeu o limite de requisições. Tente novamente em alguns instantes.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  // Executa o handler e adiciona headers de rate limit
  const response = await handler()

  // Adiciona headers de rate limit em respostas de sucesso
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Extrai identificador único da requisição
 * Usa user_id se autenticado, senão usa IP
 */
export function getRequestIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Pega IP do header X-Forwarded-For (Vercel) ou IP direto
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

  return `ip:${ip}`
}
