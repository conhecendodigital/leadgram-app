import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Cron job para renovação automática de tokens do Instagram
 * Executado diariamente via Vercel Cron
 *
 * Renova tokens que estão próximos de expirar (menos de 30 dias)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔑 [CRON] Iniciando renovação automática de tokens')

    // Criar cliente Supabase com service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Buscar contas com tokens próximos de expirar (menos de 7 dias)
    // Instagram long-lived tokens duram 60 dias e devem ser renovados antes de expirar
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: accounts, error: accountsError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('is_active', true)
      .lt('token_expires_at', sevenDaysFromNow.toISOString())

    if (accountsError) {
      console.error('❌ [CRON] Erro ao buscar contas:', accountsError)
      return NextResponse.json({ error: accountsError.message }, { status: 500 })
    }

    if (!accounts || accounts.length === 0) {
      console.log('✅ [CRON] Nenhum token precisa renovação')
      return NextResponse.json({
        success: true,
        message: 'Nenhum token precisa renovação',
        renewed: 0
      })
    }

    console.log(`🔄 [CRON] ${accounts.length} token(s) precisam renovação`)

    let totalRenewed = 0
    const errors: any[] = []

    // Renovar cada token
    for (const account of accounts) {
      try {
        const expiresAt = new Date(account.token_expires_at)
        const daysUntilExpiry = Math.floor(
          (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        console.log(`🔑 [CRON] Renovando token de @${account.username} (expira em ${daysUntilExpiry} dias)`)

        // Renovar Instagram Long-Lived Access Token
        // Referência: https://developers.facebook.com/docs/instagram-basic-display-api/guides/long-lived-access-tokens
        const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.access_token}`

        let newToken = account.access_token
        let newExpiresIn = 60 * 24 * 60 * 60 // 60 dias padrão

        try {
          const refreshResponse = await fetch(refreshUrl)

          if (!refreshResponse.ok) {
            const errorData = await refreshResponse.json().catch(() => ({}))
            console.error(`❌ [CRON] Falha ao renovar token de @${account.username}:`, errorData)

            // Se erro de token inválido, marcar conta como inativa
            if (errorData.error?.code === 190 || errorData.error?.type === 'OAuthException') {
              await supabase
                .from('instagram_accounts')
                .update({
                  is_active: false,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', account.id)

              errors.push({
                username: account.username,
                error: 'Token inválido - conta desativada. Usuário precisa reconectar.',
              })
              continue
            }

            // Outros erros - tentar novamente depois
            errors.push({
              username: account.username,
              error: `Falha ao renovar: ${errorData.error?.message || 'Erro desconhecido'}`,
            })
            continue
          }

          const refreshData = await refreshResponse.json()

          if (refreshData.access_token) {
            newToken = refreshData.access_token
            newExpiresIn = refreshData.expires_in || newExpiresIn
            console.log(`✅ [CRON] Novo token obtido para @${account.username} (válido por ${Math.floor(newExpiresIn / (24 * 60 * 60))} dias)`)
          }

        } catch (error: any) {
          console.error(`❌ [CRON] Erro ao renovar token de @${account.username}:`, error)
          errors.push({
            username: account.username,
            error: error.message,
          })
          continue
        }

        // BUG #20 FIX: Calcular data de expiração IMEDIATAMENTE após refresh bem-sucedido
        // para maior precisão (evitar defasagem de milissegundos)
        const refreshTimestamp = Date.now()
        const newExpiryDate = new Date(refreshTimestamp + (newExpiresIn * 1000))

        const { error: updateError } = await supabase
          .from('instagram_accounts')
          .update({
            access_token: newToken,
            token_expires_at: newExpiryDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id)

        if (updateError) {
          console.error(`❌ [CRON] Erro ao atualizar banco de dados para @${account.username}:`, updateError)
          errors.push({
            username: account.username,
            error: updateError.message,
          })
          continue
        }

        console.log(`✅ [CRON] Token de @${account.username} renovado com sucesso (expira em ${newExpiryDate.toLocaleString('pt-BR')})`)
        totalRenewed++

      } catch (error: any) {
        console.error(`❌ [CRON] Erro ao renovar @${account.username}:`, error)
        errors.push({
          username: account.username,
          error: error.message,
        })
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_accounts_checked: accounts.length,
      tokens_renewed: totalRenewed,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log('✅ [CRON] Renovação de tokens concluída:', summary)

    return NextResponse.json(summary)
  } catch (error: any) {
    console.error('❌ [CRON] Erro fatal:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
