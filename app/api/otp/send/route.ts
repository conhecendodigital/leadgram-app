import { NextResponse } from 'next/server'
import { OTPService } from '@/lib/services/otp-service'
import { rateLimit } from '@/lib/middleware/rate-limit'

/**
 * POST /api/otp/send
 * Gera e envia um código OTP para verificação de email ou reset de senha
 * Rate limit: 3 tentativas a cada 15 minutos (900 segundos)
 */
export async function POST(request: Request) {
  try {
    // ===== RATE LIMITING: 3 códigos a cada 15 minutos =====
    const rateLimitCheck = await rateLimit({
      max: 3,
      windowSeconds: 900, // 15 minutos
      message: 'Você já solicitou muitos códigos. Aguarde 15 minutos antes de tentar novamente.'
    })

    if (rateLimitCheck.limited) {
      return rateLimitCheck.response!
    }

    const { email, purpose, userId } = await request.json()

    // Validar campos obrigatórios
    if (!email || !purpose) {
      return NextResponse.json(
        { error: 'Email e tipo de verificação são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar propósito
    if (purpose !== 'email_verification' && purpose !== 'password_reset') {
      return NextResponse.json(
        { error: 'Tipo de verificação inválido' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Enviar OTP baseado no propósito
    let result

    if (purpose === 'email_verification') {
      result = await OTPService.sendEmailVerificationOTP(email, userId)
    } else {
      result = await OTPService.sendPasswordResetOTP(email)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao enviar código' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Código enviado com sucesso. Verifique seu email.'
    })
  } catch (error) {
    console.error('Erro ao enviar OTP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
