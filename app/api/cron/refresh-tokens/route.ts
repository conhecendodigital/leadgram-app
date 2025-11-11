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

    // Buscar contas com tokens próximos de expirar (menos de 30 dias)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: accounts, error: accountsError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('is_active', true)
      .lt('token_expires_at', thirtyDaysFromNow.toISOString())

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

        // IMPORTANTE: Page Access Tokens não expiram!
        // Se estamos usando Page Access Token, não precisa renovar
        // Apenas verificar se ainda é válido

        // Testar se token ainda funciona
        const testUrl = `https://graph.facebook.com/v18.0/${account.instagram_user_id}?fields=id&access_token=${account.access_token}`
        const testResponse = await fetch(testUrl)

        if (!testResponse.ok) {
          const error = await testResponse.json()
          console.error(`❌ [CRON] Token de @${account.username} inválido:`, error)

          // Marcar conta como inativa se token estiver inválido
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

        // Token ainda válido - atualizar data de expiração para 1 ano
        // (Page Access Tokens não expiram, mas mantemos registro)
        const newExpiryDate = new Date()
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1)

        const { error: updateError } = await supabase
          .from('instagram_accounts')
          .update({
            token_expires_at: newExpiryDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id)

        if (updateError) {
          console.error(`❌ [CRON] Erro ao atualizar @${account.username}:`, updateError)
          errors.push({
            username: account.username,
            error: updateError.message,
          })
          continue
        }

        console.log(`✅ [CRON] Token de @${account.username} verificado e atualizado`)
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
