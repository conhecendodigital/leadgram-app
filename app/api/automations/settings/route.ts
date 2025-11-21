import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Buscar configurações de automação
export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar configurações
    let { data: settings, error } = await (supabase
      .from('automation_settings') as any)
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Se não existir, criar padrão
    if (error || !settings) {
      const { data: newSettings, error: insertError } = await (supabase
        .from('automation_settings') as any)
        .insert({
          user_id: user.id,
          auto_sync_enabled: true,
          sync_frequency: 'daily'
        })
        .select()
        .single()

      if (insertError) throw insertError
      settings = newSettings
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching automation settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automation settings' },
      { status: 500 }
    )
  }
}

// POST - Atualizar configurações de automação
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { auto_sync_enabled, sync_frequency } = body

    // Validar sync_frequency
    if (sync_frequency && !['hourly', 'daily', 'weekly'].includes(sync_frequency)) {
      return NextResponse.json(
        { error: 'Invalid sync_frequency. Must be: hourly, daily, or weekly' },
        { status: 400 }
      )
    }

    // Atualizar ou inserir
    const { data: settings, error } = await (supabase
      .from('automation_settings') as any)
      .upsert({
        user_id: user.id,
        auto_sync_enabled: auto_sync_enabled !== undefined ? auto_sync_enabled : true,
        sync_frequency: sync_frequency || 'daily',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      settings,
      message: 'Configurações atualizadas com sucesso'
    })
  } catch (error) {
    console.error('Error updating automation settings:', error)
    return NextResponse.json(
      { error: 'Failed to update automation settings' },
      { status: 500 }
    )
  }
}
