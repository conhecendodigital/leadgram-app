import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getUserRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

// GET - Buscar estatísticas de email
export async function GET() {
  try {
    // Usar cliente normal para autenticação
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const role = await getUserRole(user.id)

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Usar cliente admin para operações no banco (bypass RLS)
    const adminClient = createServiceClient()

    const today = new Date().toISOString().split('T')[0]

    // Buscar estatísticas
    const [totalResult, sentResult, failedResult, todayResult] = await Promise.all([
      (adminClient.from('email_logs') as any).select('*', { count: 'exact', head: true }),
      (adminClient.from('email_logs') as any).select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      (adminClient.from('email_logs') as any).select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      (adminClient.from('email_logs') as any).select('*', { count: 'exact', head: true }).gte('created_at', today)
    ])

    return NextResponse.json({
      success: true,
      stats: {
        total: totalResult.count || 0,
        sent: sentResult.count || 0,
        failed: failedResult.count || 0,
        today: todayResult.count || 0
      }
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/email-stats:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
