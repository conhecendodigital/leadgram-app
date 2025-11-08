import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getRequestInfo } from '@/lib/utils/request-info';

/**
 * Tabela in-memory para rate limiting (simples e rápido)
 * Em produção, considere usar Redis para persistência entre deploys
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  /**
   * Número máximo de requisições permitidas
   */
  max: number;

  /**
   * Janela de tempo em segundos
   */
  windowSeconds: number;

  /**
   * Mensagem customizada quando limite for atingido
   */
  message?: string;

  /**
   * Se true, usa o user ID ao invés do IP
   */
  useUserId?: boolean;
}

/**
 * Middleware de Rate Limiting
 * Limita número de requisições por IP (ou user) em uma janela de tempo
 *
 * @example
 * // Limitar a 10 requisições por minuto
 * const rateLimitCheck = await rateLimit({ max: 10, windowSeconds: 60 });
 * if (rateLimitCheck.limited) {
 *   return rateLimitCheck.response;
 * }
 */
export async function rateLimit(config: RateLimitConfig) {
  const {
    max,
    windowSeconds,
    message = 'Muitas requisições. Tente novamente mais tarde.',
    useUserId = false
  } = config;

  try {
    let identifier: string;

    if (useUserId) {
      // Usar user ID se autenticado
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          limited: false,
          remaining: max,
          reset: Date.now() + windowSeconds * 1000
        };
      }

      identifier = `user:${user.id}`;
    } else {
      // Usar IP address
      const requestInfo = await getRequestInfo();
      identifier = `ip:${requestInfo.ipAddress}`;
    }

    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Limpar registro expirado
    if (record && now > record.resetTime) {
      rateLimitStore.delete(identifier);
    }

    // Pegar ou criar registro
    const current = rateLimitStore.get(identifier) || {
      count: 0,
      resetTime: now + windowSeconds * 1000
    };

    // Incrementar contador
    current.count++;
    rateLimitStore.set(identifier, current);

    // Verificar se excedeu limite
    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);

      return {
        limited: true,
        remaining: 0,
        reset: current.resetTime,
        response: NextResponse.json(
          {
            error: 'Rate limit excedido',
            message,
            retryAfter
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': max.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': current.resetTime.toString(),
              'Retry-After': retryAfter.toString()
            }
          }
        )
      };
    }

    return {
      limited: false,
      remaining: max - current.count,
      reset: current.resetTime
    };

  } catch (error) {
    console.error('Erro no rate limiting:', error);
    // Em caso de erro, permitir a requisição
    return {
      limited: false,
      remaining: max,
      reset: Date.now() + windowSeconds * 1000
    };
  }
}

/**
 * Limpa registros expirados do rate limit store
 * Deve ser chamado periodicamente (ex: a cada minuto)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Limpar store a cada minuto
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60000);
}
