import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getUserRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

// GET - Buscar configurações de email
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

    // Buscar configurações de email
    const { data, error } = await (adminClient
      .from('email_settings') as any)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar configurações de email:', error)
      return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
    }

    // Se não existe, criar configuração padrão
    if (!data) {
      const { data: newSettings, error: insertError } = await (adminClient
        .from('email_settings') as any)
        .insert({
          provider: 'resend',
          from_email: 'noreply@leadgram.app',
          from_name: 'Leadgram',
          enabled: false,
          daily_limit: 1000,
          emails_sent_today: 0,
          send_welcome_email: true,
          send_payment_confirmation: true,
          send_payment_failed: true,
          send_subscription_cancelled: true,
          send_password_reset: true,
          send_admin_notifications: true
        })
        .select()
        .maybeSingle()

      if (insertError) {
        console.error('Erro ao criar configurações padrão:', insertError)
        return NextResponse.json({ error: 'Erro ao criar configurações' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        settings: newSettings
      })
    }

    return NextResponse.json({
      success: true,
      settings: data
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/email-settings:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar configurações de email
export async function PUT(request: Request) {
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

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json({ error: 'Settings é obrigatório' }, { status: 400 })
    }

    // Usar cliente admin para operações no banco (bypass RLS)
    const adminClient = createServiceClient()

    // Buscar ID das configurações atuais
    const { data: current, error: fetchError } = await (adminClient
      .from('email_settings') as any)
      .select('id')
      .maybeSingle()

    if (fetchError) {
      console.error('Erro ao buscar configurações:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
    }

    if (!current) {
      return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 404 })
    }

    // Atualizar configurações
    const { error: updateError } = await (adminClient
      .from('email_settings') as any)
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id)

    if (updateError) {
      console.error('Erro ao atualizar configurações:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    })
  } catch (error) {
    console.error('Erro no PUT /api/admin/email-settings:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
