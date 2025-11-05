import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

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

    // Buscar todas as configurações
    const { data: settings, error } = await (supabase
      .from('app_settings') as any)
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error('Erro ao buscar configurações:', error)
      return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
    }

    // Organizar por categoria
    const settingsByCategory: Record<string, any> = {}
    settings?.forEach((setting: any) => {
      if (!settingsByCategory[setting.category]) {
        settingsByCategory[setting.category] = {}
      }
      settingsByCategory[setting.category][setting.key] = setting.value
    })

    return NextResponse.json({
      success: true,
      settings: settingsByCategory,
      raw: settings,
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/settings:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: 'Key é obrigatório' }, { status: 400 })
    }

    // Atualizar configuração
    const { data, error } = await (supabase
      .from('app_settings') as any)
      .update({
        value: value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar configuração:', error)
      return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      setting: data,
      message: 'Configuração atualizada com sucesso',
    })
  } catch (error) {
    console.error('Erro no POST /api/admin/settings:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings inválido' }, { status: 400 })
    }

    // Atualizar múltiplas configurações
    const updates = []
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await (supabase
        .from('app_settings') as any)
        .update({
          value: value,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('key', key)

      if (error) {
        console.error(`Erro ao atualizar ${key}:`, error)
      } else {
        updates.push(key)
      }
    }

    return NextResponse.json({
      success: true,
      updated: updates,
      message: `${updates.length} configurações atualizadas com sucesso`,
    })
  } catch (error) {
    console.error('Erro no PUT /api/admin/settings:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
