import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_EMAIL } from './lib/roles'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // Se não tem sessão e tenta acessar área protegida
  if (!session && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se tem sessão e está em página de auth
  if (session && isAuthPage) {
    const isAdmin = session.user.email === ADMIN_EMAIL
    const redirectTo = isAdmin ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // Verificar se é admin tentando acessar área admin
  if (isAdminPage && session) {
    const isAdmin = session.user.email === ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirecionar root baseado em role
  if (session && request.nextUrl.pathname === '/') {
    const isAdmin = session.user.email === ADMIN_EMAIL
    const redirectTo = isAdmin ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
