import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

// GET - Buscar estatísticas de email
export async function GET() {
  try {
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

    const today = new Date().toISOString().split('T')[0]

    // Buscar estatísticas
    const [totalResult, sentResult, failedResult, todayResult] = await Promise.all([
      (supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      (supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      (supabase.from('email_logs') as any).select('*', { count: 'exact', head: true }).gte('created_at', today)
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
