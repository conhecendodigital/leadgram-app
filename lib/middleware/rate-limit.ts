import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getRequestInfo } from '@/lib/utils/request-info';
import { Redis } from '@upstash/redis';

/**
 * Cliente Redis persistente para rate limiting
 * Funciona corretamente em ambientes serverless (Vercel)
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || ''
});

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
 * Middleware de Rate Limiting com Redis Persistente
 * Limita número de requisições por IP (ou user) em uma janela de tempo
 *
 * ✅ Funciona em serverless (Vercel)
 * ✅ Persiste entre deploys
 * ✅ Compartilhado entre todas as instâncias
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
    // Verificar se Redis está configurado
    if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
      console.warn('⚠️ UPSTASH_REDIS_URL ou UPSTASH_REDIS_TOKEN não configurado. Rate limiting desabilitado.');
      return {
        limited: false,
        remaining: max,
        reset: Date.now() + windowSeconds * 1000
      };
    }

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

    const key = `rate-limit:${identifier}`;
    const now = Date.now();

    // Incrementar contador no Redis
    const count = await redis.incr(key);

    // Se é a primeira requisição, definir expiração
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Obter TTL (tempo até expiração)
    const ttl = await redis.ttl(key);
    const resetTime = now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    // Verificar se excedeu limite
    if (count > max) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        limited: true,
        remaining: 0,
        reset: resetTime,
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
              'X-RateLimit-Reset': resetTime.toString(),
              'Retry-After': retryAfter.toString()
            }
          }
        )
      };
    }

    return {
      limited: false,
      remaining: max - count,
      reset: resetTime
    };

  } catch (error) {
    console.error('❌ Erro no rate limiting (Redis):', error);
    // Em caso de erro, permitir a requisição (fail open)
    return {
      limited: false,
      remaining: max,
      reset: Date.now() + windowSeconds * 1000
    };
  }
}
