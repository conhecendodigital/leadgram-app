import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/auth/update-password
 * Atualiza a senha de um usuário (usado após verificação de OTP)
 */
export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json()

    // Validar campos obrigatórios
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'userId e newPassword são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Atualizar senha usando service role
    const supabase = createServiceClient()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error('Erro ao atualizar senha:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
