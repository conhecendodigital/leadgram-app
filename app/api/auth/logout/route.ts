import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * API de Logout Adequada
 *
 * Funções:
 * 1. Deleta sessões ativas do banco de dados
 * 2. Registra logout nos audit_logs
 * 3. Faz logout do Supabase Auth
 *
 * Benefícios:
 * - Sessões são invalidadas no servidor
 * - Auditoria completa de logins/logouts
 * - Segurança melhorada
 */
export async function POST() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 1. Deletar todas as sessões ativas do usuário
      const { error: deleteError } = await (supabase
        .from('active_sessions') as any)
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('❌ Erro ao deletar sessões ativas:', deleteError)
        // Não bloquear logout por erro na limpeza de sessões
      }

      // 2. Registrar logout nos audit_logs
      const { error: auditError } = await (supabase
        .from('audit_logs') as any)
        .insert({
          user_id: user.id,
          action: 'user.logout',
          details: {
            timestamp: new Date().toISOString(),
            user_email: user.email
          }
        })

      if (auditError) {
        console.error('❌ Erro ao registrar audit log:', auditError)
        // Não bloquear logout por erro no log
      }

      // 3. Logout do Supabase (limpa cookies e tokens)
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        console.error('❌ Erro ao fazer signOut:', signOutError)
        return NextResponse.json(
          { success: false, error: 'Erro ao fazer logout' },
          { status: 500 }
        )
      }

      console.log('✅ Logout bem-sucedido:', user.email)
    }

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
  } catch (error) {
    console.error('❌ Erro no logout:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}
