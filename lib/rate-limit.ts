import { Redis } from '@upstash/redis'

/**
 * Rate Limiter usando Upstash Redis
 * Previne abuso de API com sliding window algorithm
 */

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

class RateLimiter {
  private redis: Redis | null = null

  constructor() {
    // Só inicializa Redis se as env vars estiverem configuradas corretamente
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    // Verificar se são valores reais (não placeholders)
    const isConfigured =
      url &&
      token &&
      url.startsWith('https://') &&
      !url.includes('your-upstash') &&
      !token.includes('your-upstash')

    if (isConfigured) {
      this.redis = new Redis({
        url,
        token,
      })
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ WARNING: Upstash Redis not configured in production! Rate limiting is DISABLED.')
    }
  }

  /**
   * Verifica se a requisição deve ser permitida
   * @param identifier - Identificador único (user_id, IP, etc)
   * @param limit - Número máximo de requisições permitidas
   * @param window - Janela de tempo em segundos (padrão: 60s)
   */
  async check(
    identifier: string,
    limit: number,
    window: number = 60
  ): Promise<RateLimitResult> {
    // Se Redis não está configurado, permite todas as requisições (desenvolvimento)
    if (!this.redis) {
      console.warn('⚠️ Rate limiting disabled - Upstash Redis not configured')
      return {
        success: true,
        limit,
        remaining: limit,
        reset: Date.now() + window * 1000,
      }
    }

    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowMs = window * 1000

    try {
      // Usa sliding window com sorted set
      const pipeline = this.redis.pipeline()

      // Remove requisições antigas (fora da janela)
      pipeline.zremrangebyscore(key, 0, now - windowMs)

      // Conta requisições na janela atual
      pipeline.zcard(key)

      // Adiciona requisição atual
      pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` })

      // Define expiração da chave
      pipeline.expire(key, window)

      const results = await pipeline.exec()

      // results[1] é o ZCARD (contagem antes de adicionar)
      const count = (results[1] as number) || 0

      const remaining = Math.max(0, limit - count - 1)
      const reset = now + windowMs

      return {
        success: count < limit,
        limit,
        remaining,
        reset,
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      // Em caso de erro, permite a requisição (fail open)
      return {
        success: true,
        limit,
        remaining: limit,
        reset: Date.now() + window * 1000,
      }
    }
  }

  /**
   * Reseta o rate limit para um identificador
   */
  async reset(identifier: string): Promise<void> {
    if (!this.redis) return

    const key = `rate_limit:${identifier}`
    await this.redis.del(key)
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Helper para criar rate limiters específicos
 */
export function createRateLimiter(limit: number, window: number = 60) {
  return async (identifier: string): Promise<RateLimitResult> => {
    return rateLimiter.check(identifier, limit, window)
  }
}

/**
 * Rate limiters pré-configurados para rotas específicas
 */
export const rateLimits = {
  // Instagram search - 10 req/min
  instagramSearch: createRateLimiter(10, 60),

  // Instagram sync - 5 req/min (operação pesada)
  instagramSync: createRateLimiter(5, 60),

  // Google Drive upload - 10 req/min
  googleDriveUpload: createRateLimiter(10, 60),

  // Criar ideias - 20 req/min
  createIdea: createRateLimiter(20, 60),

  // Checkout - 5 req/min (previne fraude)
  checkout: createRateLimiter(5, 60),

  // Geral (para outras rotas) - 30 req/min
  general: createRateLimiter(30, 60),
}
