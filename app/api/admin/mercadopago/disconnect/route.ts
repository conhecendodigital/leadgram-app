import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verificar se é admin
  const role = await getUserRole(user.id)
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Desativar todas as conexões ativas
    const { error: updateError } = await (supabase
      .from('admin_mercadopago') as any)
      .update({ is_active: false })
      .eq('is_active', true)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error disconnecting Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Erro ao desconectar Mercado Pago' },
      { status: 500 }
    )
  }
}
