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

    // Se for verificação de email, confirmar o email e criar sessão
    if (purpose === 'email_verification' && result.userId) {
      try {
        const supabase = await createServerClient()

        // Verificar email do usuário no Supabase Auth
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          result.userId,
          { email_confirm: true }
        )

        if (updateError) {
          console.error('Erro ao confirmar email no Supabase:', updateError)
          return NextResponse.json(
            { error: 'Erro ao confirmar email' },
            { status: 500 }
          )
        }

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

        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(result.userId)

        if (userError || !userData.user) {
          return NextResponse.json(
            { error: 'Erro ao buscar dados do usuário' },
            { status: 500 }
          )
        }

        // Gerar link de acesso (magic link)
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email!,
        })

        if (linkError || !linkData) {
          console.error('Erro ao gerar link de acesso:', linkError)
          return NextResponse.json(
            { error: 'Erro ao criar sessão' },
            { status: 500 }
          )
        }

        // Extrair os query parameters do link
        const url = new URL(linkData.properties.action_link)
        const token = url.searchParams.get('token')
        const type = url.searchParams.get('type')

        if (!token || !type) {
          return NextResponse.json(
            { error: 'Erro ao gerar token de sessão' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Email verificado com sucesso!',
          userId: result.userId,
          accessToken: token,
          tokenType: type
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
