import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/auth/update-password
 * Atualiza a senha de um usuário
 *
 * SEGURANÇA: Esta rota valida que o usuário está autenticado
 * antes de permitir atualização de senha
 */
export async function POST(request: Request) {
  try {
    const { newPassword } = await request.json()

    // Validar senha
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // SEGURANÇA: Buscar usuário autenticado da sessão
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login novamente.' },
        { status: 401 }
      )
    }

    // Atualizar senha do usuário autenticado
    const serviceSupabase = createServiceClient()
    const { error } = await serviceSupabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (error) {
      console.error('Erro ao atualizar senha:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    console.log('✅ Senha atualizada para usuário:', user.id)

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
