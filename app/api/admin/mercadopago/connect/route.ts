import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verificar se é admin
  const role = await getUserRole(session.user.id)
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { accessToken, publicKey, testMode } = body

  if (!accessToken || !publicKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }

  try {
    // Desativar conexões existentes
    await (supabase
      .from('admin_mercadopago') as any)
      .update({ is_active: false })
      .eq('is_active', true)

    // Criar nova conexão
    const { error: insertError } = await (supabase
      .from('admin_mercadopago') as any)
      .insert({
        access_token: accessToken,
        public_key: publicKey,
        test_mode: testMode,
        connection_type: 'manual',
        is_active: true,
        connected_at: new Date().toISOString(),
      })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error connecting Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Erro ao conectar Mercado Pago' },
      { status: 500 }
    )
  }
}
