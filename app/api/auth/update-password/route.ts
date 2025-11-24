import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PASSWORD_MIN_LENGTH, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/auth'
import { badRequest, unauthorized, serverError, success } from '@/lib/utils/api-error-handler'

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
    if (!newPassword || newPassword.length < PASSWORD_MIN_LENGTH) {
      return badRequest(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    }

    // SEGURANÇA: Buscar usuário autenticado da sessão
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return unauthorized(ERROR_MESSAGES.UNAUTHORIZED)
    }

    // Atualizar senha do usuário autenticado
    const serviceSupabase = createServiceClient()
    const { error } = await serviceSupabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (error) {
      console.error('Erro ao atualizar senha:', error)
      return serverError('Erro ao atualizar senha')
    }

    console.log('✅ Senha atualizada para usuário:', user.id)

    return success(null, SUCCESS_MESSAGES.PASSWORD_CHANGED)
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return serverError(ERROR_MESSAGES.SERVER_ERROR)
  }
}
