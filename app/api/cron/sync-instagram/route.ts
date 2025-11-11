import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Cron job para sincronização automática de Instagram
 * Executado a cada 6 horas via Vercel Cron
 *
 * Sincroniza posts de todas as contas conectadas
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorização (Vercel Cron envia header especial)
    const authHeader = request.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 [CRON] Iniciando sincronização automática de Instagram')

    // Criar cliente Supabase com service role (bypass RLS)
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

    // Buscar todas as contas ativas
    const { data: accounts, error: accountsError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('is_active', true)

    if (accountsError) {
      console.error('❌ [CRON] Erro ao buscar contas:', accountsError)
      return NextResponse.json({ error: accountsError.message }, { status: 500 })
    }

    if (!accounts || accounts.length === 0) {
      console.log('⚠️ [CRON] Nenhuma conta ativa encontrada')
      return NextResponse.json({
        success: true,
        message: 'Nenhuma conta ativa para sincronizar',
        synced: 0
      })
    }

    console.log(`📊 [CRON] Encontradas ${accounts.length} contas ativas`)

    let totalSynced = 0
    let totalNewPosts = 0
    let totalUpdated = 0
    const errors: any[] = []

    // Sincronizar cada conta
    for (const account of accounts) {
      try {
        console.log(`🔄 [CRON] Sincronizando @${account.username}...`)

        // Verificar se token está próximo de expirar (menos de 7 dias)
        const expiresAt = new Date(account.token_expires_at)
        const daysUntilExpiry = Math.floor(
          (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry < 7) {
          console.warn(`⚠️ [CRON] Token de @${account.username} expira em ${daysUntilExpiry} dias`)
        }

        // Buscar posts do Instagram
        const postsUrl = new URL(
          `https://graph.facebook.com/v18.0/${account.instagram_user_id}/media`
        )
        postsUrl.searchParams.set('fields', 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count')
        postsUrl.searchParams.set('limit', '50')
        postsUrl.searchParams.set('access_token', account.access_token)

        const response = await fetch(postsUrl.toString())

        if (!response.ok) {
          const error = await response.json()
          console.error(`❌ [CRON] Erro ao buscar posts de @${account.username}:`, error)
          errors.push({
            username: account.username,
            error: error.error?.message || 'Failed to fetch posts',
          })
          continue
        }

        const data = await response.json()
        const posts = data.data || []

        console.log(`📱 [CRON] Encontrados ${posts.length} posts de @${account.username}`)

        let newPosts = 0
        let updatedPosts = 0

        // Processar cada post
        for (const post of posts) {
          // Verificar se já existe
          const { data: existing } = await supabase
            .from('instagram_posts')
            .select('id')
            .eq('instagram_post_id', post.id)
            .eq('instagram_account_id', account.id)
            .single()

          if (existing) {
            // Atualizar post existente
            const { error: updateError } = await supabase
              .from('instagram_posts')
              .update({
                like_count: post.like_count || 0,
                comment_count: post.comments_count || 0,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)

            if (!updateError) {
              updatedPosts++
            }
          } else {
            // Inserir novo post
            const { error: insertError } = await supabase
              .from('instagram_posts')
              .insert({
                instagram_account_id: account.id,
                instagram_post_id: post.id,
                caption: post.caption,
                media_type: post.media_type,
                media_url: post.media_url,
                permalink: post.permalink,
                posted_at: post.timestamp,
                like_count: post.like_count || 0,
                comment_count: post.comments_count || 0,
              })

            if (!insertError) {
              newPosts++
            }
          }
        }

        // Atualizar last_sync_at da conta
        await supabase
          .from('instagram_accounts')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', account.id)

        console.log(`✅ [CRON] @${account.username}: ${newPosts} novos, ${updatedPosts} atualizados`)

        totalSynced++
        totalNewPosts += newPosts
        totalUpdated += updatedPosts

      } catch (error: any) {
        console.error(`❌ [CRON] Erro ao sincronizar @${account.username}:`, error)
        errors.push({
          username: account.username,
          error: error.message,
        })
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_accounts: accounts.length,
      accounts_synced: totalSynced,
      new_posts: totalNewPosts,
      updated_posts: totalUpdated,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log('✅ [CRON] Sincronização concluída:', summary)

    return NextResponse.json(summary)
  } catch (error: any) {
    console.error('❌ [CRON] Erro fatal:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
