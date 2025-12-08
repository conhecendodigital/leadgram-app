import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getUserRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

// Configurações padrão caso a tabela não exista
const DEFAULT_EMAIL_SETTINGS = {
  id: 'default',
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
  send_admin_notifications: true,
  api_key: '',
  reply_to: ''
}

// GET - Buscar configurações de email
export async function GET() {
  try {
    console.log('[email-settings] Iniciando GET...')

    // Usar cliente normal para autenticação
    const supabase = await createServerClient()
    console.log('[email-settings] Server client criado')

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[email-settings] Auth check:', { userId: user?.id, authError: authError?.message })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const role = await getUserRole(user.id)
    console.log('[email-settings] Role:', role)

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Usar cliente admin para operações no banco (bypass RLS)
    let adminClient
    try {
      console.log('[email-settings] Criando service client...')
      console.log('[email-settings] SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('[email-settings] SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      adminClient = createServiceClient()
      console.log('[email-settings] Service client criado com sucesso')
    } catch (serviceError: any) {
      console.error('[email-settings] Erro ao criar service client:', serviceError?.message)
      // Retornar configurações padrão se não conseguir criar o service client
      return NextResponse.json({
        success: true,
        settings: DEFAULT_EMAIL_SETTINGS,
        warning: 'Service client não disponível: ' + serviceError?.message
      })
    }

    // Buscar configurações de email (pegar apenas a primeira, ordenada por criação)
    const { data, error } = await (adminClient
      .from('email_settings') as any)
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    // Se a tabela não existe ou outro erro, retornar configurações padrão
    if (error) {
      console.error('Erro ao buscar configurações de email:', error.message, error.code)

      // Se for erro de tabela não existir (código 42P01), retornar defaults
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          settings: DEFAULT_EMAIL_SETTINGS,
          warning: 'Tabela email_settings não existe. Execute a migration.'
        })
      }

      return NextResponse.json({
        error: 'Erro ao buscar configurações',
        details: error.message
      }, { status: 500 })
    }

    // Se não existe registro, criar configuração padrão ou retornar defaults
    if (!data) {
      // Tentar criar configuração padrão
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
        console.error('Erro ao criar configurações padrão:', insertError.message)
        // Retornar defaults mesmo se não conseguir inserir
        return NextResponse.json({
          success: true,
          settings: DEFAULT_EMAIL_SETTINGS,
          warning: 'Não foi possível salvar configurações padrão'
        })
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
  } catch (error: any) {
    console.error('Erro no GET /api/admin/email-settings:', error?.message || error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error?.message || 'Erro desconhecido'
    }, { status: 500 })
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

    // Buscar ID das configurações atuais (pegar apenas a primeira)
    const { data: current, error: fetchError } = await (adminClient
      .from('email_settings') as any)
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

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
