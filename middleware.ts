import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Páginas públicas que não requerem verificação
  const publicPaths = ['/login', '/register', '/api']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isPublicPath) {
    return response
  }

  try {
    const supabase = await createServerClient()

    // Verificar se está em modo de manutenção
    const { data: maintenanceSetting } = await (supabase
      .from('app_settings') as any)
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    const isMaintenanceMode = maintenanceSetting?.value === true

    if (isMaintenanceMode) {
      // Verificar se o usuário é admin
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await (supabase
          .from('profiles') as any)
          .select('role')
          .eq('id', user.id)
          .single()

        // Se não for admin, redirecionar para página de manutenção
        if (profile?.role !== 'admin' && !request.nextUrl.pathname.startsWith('/maintenance')) {
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      } else {
        // Usuário não autenticado e app em manutenção
        if (!request.nextUrl.pathname.startsWith('/maintenance')) {
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      }
    } else {
      // Se não está em manutenção e tentando acessar /maintenance, redirecionar
      if (request.nextUrl.pathname.startsWith('/maintenance')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  } catch (error) {
    console.error('Erro no middleware:', error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
