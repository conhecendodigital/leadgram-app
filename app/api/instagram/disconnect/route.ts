import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Desativar conta Instagram
    const { error } = await (supabase
      .from('instagram_accounts') as any)
      .update({ is_active: false })
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Instagram:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram' },
      { status: 500 }
    )
  }
}
