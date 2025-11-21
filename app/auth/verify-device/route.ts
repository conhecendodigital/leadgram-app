import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { DeviceVerificationService } from '@/lib/services/device-verification-service'

/**
 * Callback para verificação de dispositivo via magic link
 * Quando o usuário clica no link enviado por email, esta rota:
 * 1. Verifica o token do magic link
 * 2. Marca o dispositivo atual como confiável
 * 3. Redireciona para o dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!token_hash || type !== 'magiclink') {
      return NextResponse.redirect(
        new URL('/login?error=invalid_link', request.url)
      )
    }

    const supabase = await createServerClient()

    // Verificar e autenticar com o magic link token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'magiclink'
    })

    if (error || !data.user) {
      console.error('Erro ao verificar magic link:', error)
      return NextResponse.redirect(
        new URL('/login?error=verification_failed', request.url)
      )
    }

    // ✅ Token válido - marcar dispositivo atual como confiável
    try {
      await DeviceVerificationService.trustCurrentDevice(data.user.id)
      console.log('✅ Dispositivo marcado como confiável para:', data.user.email)
    } catch (trustError) {
      console.error('Erro ao marcar dispositivo como confiável:', trustError)
      // Continuar mesmo se falhar (usuário já está autenticado)
    }

    // Redirecionar para dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Erro no callback de verificação:', error)
    return NextResponse.redirect(
      new URL('/login?error=unexpected_error', request.url)
    )
  }
}
