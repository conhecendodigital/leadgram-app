import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/settings/notifications
 * Busca preferências de notificações do usuário
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

    // Buscar preferências
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Se não existir, criar com valores padrão
    if (error && error.code === 'PGRST116') {
      const { data: newPreferences, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          email_enabled: true,
          push_enabled: false,
          content_ideas: true,
          goal_achievements: true,
          instagram_sync: true,
          system_updates: false,
          frequency: 'instant',
          quiet_hours_enabled: false,
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating notification preferences:', insertError)
        return NextResponse.json(
          { error: 'Failed to create notification preferences' },
          { status: 500 }
        )
      }

      return NextResponse.json(newPreferences)
    }

    if (error) {
      console.error('Error fetching notification preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notification preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error in GET /api/settings/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/settings/notifications
 * Atualiza preferências de notificações do usuário
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos permitidos
    const allowedFields = [
      'email_enabled',
      'push_enabled',
      'content_ideas',
      'goal_achievements',
      'instagram_sync',
      'system_updates',
      'frequency',
      'quiet_hours_enabled',
      'quiet_hours_start',
      'quiet_hours_end',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Validar frequency
    if (updateData.frequency && !['instant', 'daily', 'weekly'].includes(updateData.frequency)) {
      return NextResponse.json({ error: 'Invalid frequency value' }, { status: 400 })
    }

    // Atualizar preferências
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification preferences:', error)
      return NextResponse.json(
        { error: 'Failed to update notification preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/settings/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
