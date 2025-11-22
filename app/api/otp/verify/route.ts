import { NextResponse } from 'next/server'
import { OTPService } from '@/lib/services/otp-service'
import { createServerClient } from '@/lib/supabase/server'

/**
 * POST /api/otp/verify
 * Verifica um código OTP
 */
export async function POST(request: Request) {
  try {
    const { email, code, purpose } = await request.json()

    // Validar campos obrigatórios
    if (!email || !code || !purpose) {
      return NextResponse.json(
        { error: 'Email, código e propósito são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar propósito
    if (purpose !== 'email_verification' && purpose !== 'password_reset') {
      return NextResponse.json(
        { error: 'Propósito inválido' },
        { status: 400 }
      )
    }

    // Verificar OTP
    const result = await OTPService.verifyOTP(email, code, purpose)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Código inválido' },
        { status: 400 }
      )
    }

    // Se for verificação de email, marcar como verificado no perfil
    if (purpose === 'email_verification' && result.userId) {
      try {
        const supabase = await createServerClient()

        // Marcar email como verificado no perfil
        const { error: profileError } = await (supabase
          .from('profiles') as any)
          .update({
            email_verified_at: new Date().toISOString()
          })
          .eq('id', result.userId)

        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError)
          // Não bloquear o fluxo se falhar
        }

        console.log('✅ Email verificado via OTP para usuário:', result.userId)

        // O Supabase já criou a sessão automaticamente via verifyOtp
        // Apenas retornar sucesso
        return NextResponse.json({
          success: true,
          message: 'Email verificado com sucesso!',
          userId: result.userId
        })
      } catch (error) {
        console.error('Erro ao processar verificação de email:', error)
        return NextResponse.json(
          { error: 'Erro ao processar verificação' },
          { status: 500 }
        )
      }
    }

    // Para reset de senha, apenas retornar sucesso com o otpId
    return NextResponse.json({
      success: true,
      message: 'Código verificado com sucesso!',
      otpId: result.otpId,
      userId: result.userId
    })
  } catch (error) {
    console.error('Erro ao verificar OTP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
