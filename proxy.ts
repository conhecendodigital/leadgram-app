import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'
import { ADMIN_EMAIL } from './lib/roles'

export async function proxy(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register')
  const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

  // Se não tem sessão e tenta acessar área protegida
  if (!session && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se tem sessão e está em página de auth
  if (session && isAuthPage) {
    const isAdmin = session.user.email === ADMIN_EMAIL
    const redirectTo = isAdmin ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // Verificar se é admin tentando acessar área admin
  if (isAdminPage && session) {
    const isAdmin = session.user.email === ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirecionar root baseado em role
  if (session && req.nextUrl.pathname === '/') {
    const isAdmin = session.user.email === ADMIN_EMAIL
    const redirectTo = isAdmin ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
