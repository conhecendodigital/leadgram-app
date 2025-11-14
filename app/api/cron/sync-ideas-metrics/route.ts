import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Cron job para sincronizacao automatica de metricas do Instagram
 * Executado a cada 6 horas via Vercel Cron
 *
 * Busca todas as ideias que tem posts do Instagram vinculados
 * e atualiza suas metricas automaticamente
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorizacao (Vercel Cron envia header especial)
    const authHeader = request.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 [CRON] Iniciando sincronizacao de metricas das ideias')

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

    // Buscar todas as plataformas do Instagram que tem post_id
    const { data: platforms, error: platformsError } = await supabase
      .from('idea_platforms')
      .select(`
        id,
        idea_id,
        platform,
        platform_post_id,
        post_url,
        ideas!inner(user_id)
      `)
      .eq('platform', 'instagram')
      .eq('is_posted', true)
      .not('platform_post_id', 'is', null)

    if (platformsError) {
      console.error('❌ [CRON] Erro ao buscar plataformas:', platformsError)
      return NextResponse.json({ error: platformsError.message }, { status: 500 })
    }

    if (!platforms || platforms.length === 0) {
      console.log('⚠️ [CRON] Nenhuma plataforma Instagram para sincronizar')
      return NextResponse.json({
        success: true,
        message: 'Nenhuma plataforma para sincronizar',
        synced: 0,
      })
    }

    console.log(`📊 [CRON] Encontradas ${platforms.length} plataformas para sincronizar`)

    let totalSynced = 0
    let totalErrors = 0
    const errors: any[] = []

    // Agrupar plataformas por usuario para buscar token do Instagram
    const platformsByUser = platforms.reduce((acc: any, platform: any) => {
      const userId = platform.ideas.user_id
      if (!acc[userId]) {
        acc[userId] = []
      }
      acc[userId].push(platform)
      return acc
    }, {})

    // Processar cada usuario
    for (const [userId, userPlatforms] of Object.entries(platformsByUser)) {
      try {
        // Buscar conta do Instagram do usuario
        const { data: instagramAccount, error: accountError } = await supabase
          .from('instagram_accounts')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single()

        if (accountError || !instagramAccount) {
          console.warn(`⚠️ [CRON] Usuario ${userId} nao tem conta Instagram conectada`)
          continue
        }

        // Processar cada plataforma do usuario
        for (const platform of userPlatforms as any[]) {
          try {
            const mediaId = platform.platform_post_id

            console.log(`🔄 [CRON] Sincronizando post ${mediaId}`)

            // Buscar metricas do post via Instagram Graph API
            const url = new URL(`https://graph.instagram.com/${mediaId}`)
            url.searchParams.set(
              'fields',
              'like_count,comments_count,insights.metric(impressions,reach,saved)'
            )
            url.searchParams.set('access_token', instagramAccount.access_token)

            const response = await fetch(url.toString())

            if (!response.ok) {
              const error = await response.json()
              console.error(`❌ [CRON] Erro ao buscar metricas do post ${mediaId}:`, error)
              errors.push({
                platform_id: platform.id,
                media_id: mediaId,
                error: error.error?.message || 'Failed to fetch metrics',
              })
              totalErrors++
              continue
            }

            const data = await response.json()

            // Extrair metricas
            const likes = data.like_count || 0
            const comments = data.comments_count || 0

            // Insights
            let impressions = 0
            let reach = 0
            let saves = 0

            if (data.insights && data.insights.data) {
              const impressionsData = data.insights.data.find(
                (i: any) => i.name === 'impressions'
              )
              const reachData = data.insights.data.find((i: any) => i.name === 'reach')
              const savedData = data.insights.data.find((i: any) => i.name === 'saved')

              impressions = impressionsData?.values?.[0]?.value || 0
              reach = reachData?.values?.[0]?.value || 0
              saves = savedData?.values?.[0]?.value || 0
            }

            // Calcular engagement rate
            const views = impressions > 0 ? impressions : reach
            const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0

            // Inserir nova metrica
            const { error: insertError } = await supabase.from('metrics').insert({
              idea_platform_id: platform.id,
              views: views,
              likes: likes,
              comments: comments,
              shares: 0,
              saves: saves,
              reach: reach,
              impressions: impressions,
              engagement_rate: parseFloat(engagementRate.toFixed(2)),
              source: 'instagram_api',
            })

            if (insertError) {
              console.error(`❌ [CRON] Erro ao inserir metrica:`, insertError)
              errors.push({
                platform_id: platform.id,
                media_id: mediaId,
                error: insertError.message,
              })
              totalErrors++
            } else {
              console.log(`✅ [CRON] Metrica sincronizada para post ${mediaId}`)
              totalSynced++
            }
          } catch (error: any) {
            console.error(`❌ [CRON] Erro ao processar plataforma ${platform.id}:`, error)
            errors.push({
              platform_id: platform.id,
              error: error.message,
            })
            totalErrors++
          }
        }
      } catch (error: any) {
        console.error(`❌ [CRON] Erro ao processar usuario ${userId}:`, error)
        errors.push({
          user_id: userId,
          error: error.message,
        })
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_platforms: platforms.length,
      platforms_synced: totalSynced,
      platforms_errors: totalErrors,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log('✅ [CRON] Sincronizacao de metricas concluida:', summary)

    return NextResponse.json(summary)
  } catch (error: any) {
    console.error('❌ [CRON] Erro fatal:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
