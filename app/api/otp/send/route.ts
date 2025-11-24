import { NextResponse } from 'next/server'
import { OTPService } from '@/lib/services/otp-service'
import { rateLimit } from '@/lib/middleware/rate-limit'
import { OTP_SEND_RATE_LIMIT, ERROR_MESSAGES, SUCCESS_MESSAGES, PATTERNS, OTP_PURPOSES } from '@/lib/constants/auth'

/**
 * POST /api/otp/send
 * Gera e envia um código OTP para verificação de email ou reset de senha
 * Rate limit: 3 tentativas a cada 15 minutos (900 segundos)
 */
export async function POST(request: Request) {
  try {
    // ===== RATE LIMITING =====
    const rateLimitCheck = await rateLimit({
      max: OTP_SEND_RATE_LIMIT.MAX_ATTEMPTS,
      windowSeconds: OTP_SEND_RATE_LIMIT.WINDOW_SECONDS,
      message: OTP_SEND_RATE_LIMIT.MESSAGE
    })

    if (rateLimitCheck.limited) {
      return rateLimitCheck.response!
    }

    const { email, purpose, userId } = await request.json()

    // Validar campos obrigatórios
    if (!email || !purpose) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.EMAIL_REQUIRED },
        { status: 400 }
      )
    }

    // Validar propósito
    if (purpose !== OTP_PURPOSES.EMAIL_VERIFICATION && purpose !== OTP_PURPOSES.PASSWORD_RESET) {
      return NextResponse.json(
        { error: 'Tipo de verificação inválido' },
        { status: 400 }
      )
    }

    // Validar formato de email
    if (!PATTERNS.EMAIL.test(email)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.EMAIL_INVALID },
        { status: 400 }
      )
    }

    // Enviar OTP baseado no propósito
    let result

    if (purpose === OTP_PURPOSES.EMAIL_VERIFICATION) {
      result = await OTPService.sendEmailVerificationOTP(email, userId)
    } else {
      result = await OTPService.sendPasswordResetOTP(email)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.SERVER_ERROR },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT
    })
  } catch (error) {
    console.error('Erro ao enviar OTP:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    )
  }
}
