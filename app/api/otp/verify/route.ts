import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/auth'
import { badRequest, unauthorized, forbidden, serverError, success } from '@/lib/utils/api-error-handler'
import { protectCSRF } from '@/lib/middleware/csrf-protection'

/**
 * POST /api/otp/verify
 *
 * API SIMPLIFICADA de verificação OTP
 *
 * IMPORTANTE: O código OTP já foi verificado no client-side via supabase.auth.verifyOtp()
 * Esta API apenas marca o email como verificado no perfil do usuário.
 *
 * Fluxo:
 * 1. Client verifica OTP → cria sessão automaticamente
 * 2. Client chama esta API (já autenticado)
 * 3. API marca email_verified_at no perfil
 */
export async function POST(request: Request) {
  try {
    // ===== CSRF PROTECTION =====
    const csrfError = await protectCSRF(request);
    if (csrfError) return csrfError;

    const { email } = await request.json()

    // Validar email
    if (!email) {
      return badRequest(ERROR_MESSAGES.EMAIL_REQUIRED)
    }

    const supabase = await createServerClient()

    // Buscar usuário autenticado (já verificou OTP no client)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return unauthorized(ERROR_MESSAGES.UNAUTHORIZED)
    }

    // Verificar que o email corresponde ao usuário autenticado
    if (user.email !== email) {
      return forbidden('Email não corresponde ao usuário autenticado')
    }

    // Marcar email como verificado no perfil
    const { error: updateError } = await (supabase
      .from('profiles') as any)
      .update({ email_verified_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError)
      return serverError('Erro ao marcar email como verificado')
    }

    console.log('✅ Email marcado como verificado:', email)

    return success(null, SUCCESS_MESSAGES.EMAIL_VERIFIED)
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error)
    return serverError(ERROR_MESSAGES.SERVER_ERROR)
  }
}
