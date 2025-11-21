import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Buscar histórico de sincronizações
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Buscar histórico (últimas N sincronizações)
    const { data: history, error, count } = await (supabase
      .from('sync_history') as any)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Buscar última sincronização bem-sucedida
    const { data: lastSuccess } = await (supabase
      .from('sync_history') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      history: history || [],
      total: count || 0,
      lastSuccess: lastSuccess || null
    })
  } catch (error) {
    console.error('Error fetching sync history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync history' },
      { status: 500 }
    )
  }
}
