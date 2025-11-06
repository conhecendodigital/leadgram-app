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
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register')
  const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
  const isMaintenancePage = req.nextUrl.pathname.startsWith('/maintenance')
  const isApiPath = req.nextUrl.pathname.startsWith('/api')

  // Verificar modo de manutenção (exceto para API e página de manutenção)
  if (!isApiPath && !isMaintenancePage) {
    try {
      const { data: maintenanceSetting } = await (supabase
        .from('app_settings') as any)
        .select('value')
        .eq('key', 'maintenance_mode')
        .single()

      const isMaintenanceMode = maintenanceSetting?.value === true

      if (isMaintenanceMode) {
        // Verificar se o usuário é admin
        let isAdmin = false
        if (user) {
          const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('role')
            .eq('id', user.id)
            .single()

          isAdmin = profile?.role === 'admin' || user.email === ADMIN_EMAIL
        }

        // Se não for admin, redirecionar para página de manutenção
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/maintenance', req.url))
        }
      }
    } catch (error) {
      console.error('Erro ao verificar modo de manutenção:', error)
    }
  }

  // Se não está em manutenção e tentando acessar /maintenance, redirecionar
  if (isMaintenancePage && !isAuthPage) {
    try {
      const { data: maintenanceSetting } = await (supabase
        .from('app_settings') as any)
        .select('value')
        .eq('key', 'maintenance_mode')
        .single()

      const isMaintenanceMode = maintenanceSetting?.value === true

      if (!isMaintenanceMode) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    } catch (error) {
      console.error('Erro ao verificar modo de manutenção:', error)
    }
  }

  // Se não tem user e tenta acessar área protegida
  if (!user && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se tem user e está em página de auth
  if (user && isAuthPage) {
    const isAdmin = user.email === ADMIN_EMAIL
    const redirectTo = isAdmin ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // Verificar se é admin tentando acessar área admin
  if (isAdminPage && user) {
    const isAdmin = user.email === ADMIN_EMAIL
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirecionar root baseado em role
  if (user && req.nextUrl.pathname === '/') {
    const isAdmin = user.email === ADMIN_EMAIL
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
