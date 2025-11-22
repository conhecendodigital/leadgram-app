import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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
    const { email } = await request.json()

    // Validar email
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Buscar usuário autenticado (já verificou OTP no client)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login novamente.' },
        { status: 401 }
      )
    }

    // Verificar que o email corresponde ao usuário autenticado
    if (user.email !== email) {
      return NextResponse.json(
        { error: 'Email não corresponde ao usuário autenticado' },
        { status: 403 }
      )
    }

    // Marcar email como verificado no perfil
    const { error: updateError } = await (supabase
      .from('profiles') as any)
      .update({ email_verified_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError)
      return NextResponse.json(
        { error: 'Erro ao marcar email como verificado' },
        { status: 500 }
      )
    }

    console.log('✅ Email marcado como verificado:', email)

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso!'
    })
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
