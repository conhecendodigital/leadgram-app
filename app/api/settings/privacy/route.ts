import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * PUT /api/settings/privacy
 * Atualiza configurações de privacidade do usuário
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
    const allowedFields = ['visibility', 'share_analytics', 'show_in_search']

    const updateData: any = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Validar visibility
    if (updateData.visibility && !['public', 'private'].includes(updateData.visibility)) {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 })
    }

    // Atualizar perfil
    const { data, error } = await (supabase
      .from('profiles') as any)
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating privacy settings:', error)
      return NextResponse.json(
        { error: 'Failed to update privacy settings' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/settings/privacy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
