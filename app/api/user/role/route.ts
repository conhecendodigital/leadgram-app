import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles'

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

    return NextResponse.json({
      role,
      isAdmin: role === 'admin',
    })
  } catch (error) {
    console.error('Erro ao verificar role:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar permissões' },
      { status: 500 }
    )
  }
}
