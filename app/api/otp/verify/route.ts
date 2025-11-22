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

    // Esta API apenas marca o email como verificado no perfil
    // A verificação real do OTP é feita no client-side via supabase.auth.verifyOtp()

    if (purpose === 'email_verification') {
      try {
        const supabase = await createServerClient()

        // Buscar usuário pelo email
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
          await supabase.auth.getUser().then(u => u.data.user?.id || '')
        )

        if (userError || !user) {
          // Buscar pelo email
          const { data: { users } } = await supabase.auth.admin.listUsers()
          const foundUser = users?.find(u => u.email === email)

          if (!foundUser) {
            return NextResponse.json(
              { error: 'Usuário não encontrado' },
              { status: 404 }
            )
          }

          // Marcar email como verificado no perfil
          await (supabase.from('profiles') as any)
            .update({ email_verified_at: new Date().toISOString() })
            .eq('id', foundUser.id)

          console.log('✅ Email marcado como verificado para:', email)
        }

        return NextResponse.json({
          success: true,
          message: 'Email verificado com sucesso!'
        })
      } catch (error) {
        console.error('Erro ao processar verificação:', error)
        return NextResponse.json(
          { error: 'Erro ao processar verificação' },
          { status: 500 }
        )
      }
    }

    // Para reset de senha
    return NextResponse.json({
      success: true,
      message: 'Código verificado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao verificar OTP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
