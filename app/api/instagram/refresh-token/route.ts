import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Endpoint manual para renovar token do Instagram
 * Permite ao usuário renovar manualmente sem esperar o cron
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    console.log('🔑 [REFRESH] Iniciando renovação manual de token para usuário:', user.id)

    // Buscar conta ativa do Instagram
    const { data: account, error: accountError } = await (supabase
      .from('instagram_accounts') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Nenhuma conta Instagram conectada' },
        { status: 400 }
      )
    }

    const expiresAt = new Date(account.token_expires_at)
    const daysUntilExpiry = Math.floor(
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    console.log(`🔑 [REFRESH] Renovando token de @${account.username} (expira em ${daysUntilExpiry} dias)`)

    // Renovar Instagram Long-Lived Access Token
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.access_token}`

    const refreshResponse = await fetch(refreshUrl)

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json().catch(() => ({}))
      console.error(`❌ [REFRESH] Falha ao renovar token:`, errorData)

      // Se erro de token inválido, marcar conta como inativa
      if (errorData.error?.code === 190 || errorData.error?.type === 'OAuthException') {
        await (supabase
          .from('instagram_accounts') as any)
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id)

        return NextResponse.json(
          { error: 'Token inválido. Por favor, reconecte sua conta Instagram.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: errorData.error?.message || 'Erro ao renovar token' },
        { status: 500 }
      )
    }

    const refreshData = await refreshResponse.json()

    if (!refreshData.access_token) {
      return NextResponse.json(
        { error: 'Resposta inválida da API do Instagram' },
        { status: 500 }
      )
    }

    const newToken = refreshData.access_token
    const newExpiresIn = refreshData.expires_in || (60 * 24 * 60 * 60) // 60 dias padrão
    const newExpiryDate = new Date(Date.now() + (newExpiresIn * 1000))

    console.log(`✅ [REFRESH] Novo token obtido (válido por ${Math.floor(newExpiresIn / (24 * 60 * 60))} dias)`)

    // Atualizar token e data de expiração no banco
    const { error: updateError } = await (supabase
      .from('instagram_accounts') as any)
      .update({
        access_token: newToken,
        token_expires_at: newExpiryDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id)

    if (updateError) {
      console.error(`❌ [REFRESH] Erro ao atualizar banco de dados:`, updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar novo token' },
        { status: 500 }
      )
    }

    console.log(`✅ [REFRESH] Token renovado com sucesso (expira em ${newExpiryDate.toLocaleString('pt-BR')})`)

    return NextResponse.json({
      success: true,
      message: 'Token renovado com sucesso',
      expiresAt: newExpiryDate.toISOString(),
      daysValid: Math.floor(newExpiresIn / (24 * 60 * 60)),
    })

  } catch (error: any) {
    console.error('❌ [REFRESH] Erro fatal:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao renovar token' },
      { status: 500 }
    )
  }
}
