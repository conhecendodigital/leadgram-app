import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'

/**
 * CSRF Protection Middleware
 *
 * Protege contra ataques Cross-Site Request Forgery verificando:
 * 1. Origin header corresponde ao host
 * 2. Referer header (se presente) é do mesmo domínio
 *
 * Métodos protegidos: POST, PUT, PATCH, DELETE
 * Métodos não protegidos: GET, HEAD, OPTIONS
 */

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean) as string[]

interface CSRFCheckResult {
  valid: boolean
  error?: string
  response?: NextResponse
}

/**
 * Verifica se a requisição é segura contra CSRF
 */
export async function checkCSRF(request: Request): Promise<CSRFCheckResult> {
  const method = request.method

  // Métodos seguros não precisam de proteção CSRF
  if (SAFE_METHODS.includes(method)) {
    return { valid: true }
  }

  // Pegar headers
  const headersList = await headers()
  const origin = headersList.get('origin')
  const referer = headersList.get('referer')
  const host = headersList.get('host')

  // 1. Verificar Origin header (mais confiável)
  if (origin) {
    const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => {
      try {
        const allowedUrl = new URL(allowed)
        const originUrl = new URL(origin)
        return allowedUrl.host === originUrl.host
      } catch {
        return false
      }
    })

    if (!isAllowedOrigin) {
      console.warn('🚫 CSRF: Origin não permitido:', origin)
      return {
        valid: false,
        error: 'Origin não permitido',
        response: NextResponse.json(
          { error: 'Requisição inválida' },
          { status: 403 }
        )
      }
    }

    return { valid: true }
  }

  // 2. Fallback para Referer header (menos confiável)
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const isAllowedReferer = ALLOWED_ORIGINS.some(allowed => {
        try {
          const allowedUrl = new URL(allowed)
          return allowedUrl.host === refererUrl.host
        } catch {
          return false
        }
      })

      if (!isAllowedReferer) {
        console.warn('🚫 CSRF: Referer não permitido:', referer)
        return {
          valid: false,
          error: 'Referer não permitido',
          response: NextResponse.json(
            { error: 'Requisição inválida' },
            { status: 403 }
          )
        }
      }

      return { valid: true }
    } catch {
      // Referer inválido
      console.warn('🚫 CSRF: Referer inválido:', referer)
    }
  }

  // 3. Se não tem origin nem referer válido, bloquear
  // Isso protege contra requisições de sites externos
  console.warn('🚫 CSRF: Sem Origin ou Referer válido')
  return {
    valid: false,
    error: 'Headers de segurança ausentes',
    response: NextResponse.json(
      { error: 'Requisição inválida' },
      { status: 403 }
    )
  }
}

/**
 * Middleware wrapper para proteger uma API route contra CSRF
 *
 * @example
 * export async function POST(request: Request) {
 *   const csrfCheck = await withCSRFProtection(request)
 *   if (csrfCheck.response) return csrfCheck.response
 *
 *   // Sua lógica da API aqui...
 * }
 */
export async function withCSRFProtection(request: Request): Promise<CSRFCheckResult> {
  return checkCSRF(request)
}

/**
 * Helper para APIs que precisam de CSRF protection
 * Uso: return await protectCSRF(request) || yourLogic()
 */
export async function protectCSRF(request: Request): Promise<NextResponse | null> {
  const check = await checkCSRF(request)
  return check.response || null
}
