import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de Proteção de Rotas
 *
 * Funções:
 * 1. Protege rotas do dashboard e admin (requer autenticação)
 * 2. Redireciona usuários autenticados que tentam acessar páginas de auth
 * 3. Valida role admin para rotas /admin/*
 *
 * Benefícios:
 * - Centraliza lógica de autenticação
 * - Elimina código duplicado nas páginas
 * - Segurança em nível de aplicação
 */
export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Definir tipos de rotas
    const isAuthPage = path === '/login' ||
                      path === '/register' ||
                      path === '/forgot-password' ||
                      path === '/reset-password'

    const isDashboardPage = path.startsWith('/dashboard')
    const isAdminPage = path.startsWith('/admin')
    const isVerifyEmailPage = path === '/verify-email'

    // CASO 1: Usuário NÃO autenticado tentando acessar área protegida
    if (!user && (isDashboardPage || isAdminPage)) {
      const loginUrl = new URL('/login', request.url)
      // Salvar URL de destino para redirecionar após login
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    // CASO 2: Usuário autenticado tentando acessar página de auth
    // (exceto verify-email, que precisa estar autenticado)
    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // CASO 3: Verificar role admin para rotas /admin/*
    if (isAdminPage && user) {
      const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        console.warn(`⚠️ Usuário ${user.email} tentou acessar área admin sem permissão`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('❌ Erro no middleware:', error)
    // Em caso de erro, permitir acesso (fail open) para não travar o app
    return NextResponse.next()
  }
}

/**
 * Configuração do matcher
 * Define quais rotas o middleware deve interceptar
 *
 * Exclui:
 * - /api/* (APIs têm sua própria autenticação)
 * - /_next/* (arquivos estáticos do Next.js)
 * - /favicon.ico, /robots.txt, etc
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, etc (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*|legal).*)',
  ]
}
