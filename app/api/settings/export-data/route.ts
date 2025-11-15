import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/settings/export-data
 * Exporta todos os dados do usuário em formato JSON
 */
export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Buscar ideias com plataformas e métricas
    const { data: ideas } = await supabase
      .from('ideas')
      .select(`
        *,
        idea_platforms (
          *,
          metrics (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Buscar contas Instagram conectadas
    const { data: instagramAccounts } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', user.id)

    // Buscar assinatura
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Buscar preferências de notificações
    const { data: notificationPreferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Buscar notificações
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    // Calcular estatísticas
    const stats = {
      total_ideas: ideas?.length || 0,
      posted_ideas: ideas?.filter((i: any) => i.status === 'posted').length || 0,
      recorded_ideas: ideas?.filter((i: any) => i.status === 'recorded').length || 0,
      total_notifications: notifications?.length || 0,
      instagram_accounts_connected: instagramAccounts?.length || 0,
      account_created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    }

    // Montar objeto de exportação
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile: profile || null,
      ideas: ideas || [],
      instagramAccounts: instagramAccounts || [],
      subscription: subscription || null,
      notificationPreferences: notificationPreferences || null,
      notifications: notifications || [],
      statistics: stats,
      metadata: {
        format: 'JSON',
        version: '1.0',
        source: 'Leadgram',
      },
    }

    // Retornar como JSON para download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="leadgram-data-${user.id}-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/settings/export-data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
