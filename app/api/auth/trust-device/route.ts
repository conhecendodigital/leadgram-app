import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { DeviceVerificationService } from '@/lib/services/device-verification-service'

/**
 * API para marcar o dispositivo atual como confiável
 * Chamada após registro bem-sucedido ou verificação de email
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Marcar dispositivo atual como confiável
    await DeviceVerificationService.trustCurrentDevice(user.id)

    return NextResponse.json({
      success: true,
      message: 'Dispositivo marcado como confiável'
    })
  } catch (error) {
    console.error('Erro ao confiar dispositivo:', error)
    return NextResponse.json(
      {
        error: 'Erro ao marcar dispositivo como confiável',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
