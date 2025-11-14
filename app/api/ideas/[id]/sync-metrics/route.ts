import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/ideas/[id]/sync-metrics
 *
 * Sincroniza metricas do Instagram para uma ideia especifica
 * Busca todas as plataformas vinculadas e atualiza as metricas
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()

    // Verificar autenticacao
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const { id } = await params
    const ideaId = id

    // Verificar se a ideia pertence ao usuario
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Ideia nao encontrada' },
        { status: 404 }
      )
    }

    // Buscar plataformas vinculadas a esta ideia
    const { data: platforms, error: platformsError } = await (supabase
      .from('idea_platforms') as any)
      .select('*')
      .eq('idea_id', ideaId)

    if (platformsError) {
      console.error('Erro ao buscar plataformas:', platformsError)
      return NextResponse.json(
        { error: 'Erro ao buscar plataformas' },
        { status: 500 }
      )
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma plataforma vinculada a esta ideia' },
        { status: 404 }
      )
    }

    // Buscar conta do Instagram conectada
    const { data: instagramAccount, error: accountError } = await (supabase
      .from('instagram_accounts') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (accountError || !instagramAccount) {
      return NextResponse.json(
        { error: 'Nenhuma conta Instagram conectada' },
        { status: 404 }
      )
    }

    const results = []
    let totalSynced = 0
    let totalErrors = 0

    // Processar cada plataforma
    for (const platform of platforms) {
      // Apenas processar Instagram por enquanto
      if (platform.platform !== 'instagram') {
        continue
      }

      // Verificar se tem platform_post_id
      if (!platform.platform_post_id) {
        results.push({
          platform: platform.platform,
          status: 'skipped',
          reason: 'Nenhum post ID vinculado',
        })
        continue
      }

      try {
        // Buscar metricas do post via Instagram Graph API
        const mediaId = platform.platform_post_id
        const url = new URL(`https://graph.instagram.com/${mediaId}`)
        url.searchParams.set(
          'fields',
          'like_count,comments_count,insights.metric(impressions,reach,saved)'
        )
        url.searchParams.set('access_token', instagramAccount.access_token)

        console.log('Buscando metricas para post:', mediaId)

        const response = await fetch(url.toString())

        if (!response.ok) {
          const error = await response.json()
          console.error('Erro ao buscar metricas:', error)
          results.push({
            platform: platform.platform,
            post_id: mediaId,
            status: 'error',
            error: error.error?.message || 'Failed to fetch metrics',
          })
          totalErrors++
          continue
        }

        const data = await response.json()

        // Extrair metricas
        const likes = data.like_count || 0
        const comments = data.comments_count || 0

        // Insights (pode nao estar disponivel para todos os posts)
        let impressions = 0
        let reach = 0
        let saves = 0

        if (data.insights && data.insights.data) {
          const impressionsData = data.insights.data.find(
            (i: any) => i.name === 'impressions'
          )
          const reachData = data.insights.data.find(
            (i: any) => i.name === 'reach'
          )
          const savedData = data.insights.data.find(
            (i: any) => i.name === 'saved'
          )

          impressions = impressionsData?.values?.[0]?.value || 0
          reach = reachData?.values?.[0]?.value || 0
          saves = savedData?.values?.[0]?.value || 0
        }

        // Calcular engagement rate
        const views = impressions > 0 ? impressions : reach
        const engagementRate =
          views > 0 ? ((likes + comments) / views) * 100 : 0

        // Inserir nova metrica na tabela metrics
        const { error: insertError } = await (supabase
          .from('metrics') as any).insert({
          idea_platform_id: platform.id,
          views: views,
          likes: likes,
          comments: comments,
          shares: 0, // Instagram API nao fornece
          saves: saves,
          reach: reach,
          impressions: impressions,
          engagement_rate: parseFloat(engagementRate.toFixed(2)),
          source: 'instagram_api',
        })

        if (insertError) {
          console.error('Erro ao inserir metrica:', insertError)
          results.push({
            platform: platform.platform,
            post_id: mediaId,
            status: 'error',
            error: insertError.message,
          })
          totalErrors++
        } else {
          results.push({
            platform: platform.platform,
            post_id: mediaId,
            status: 'success',
            metrics: {
              views,
              likes,
              comments,
              saves,
              reach,
              impressions,
              engagement_rate: engagementRate,
            },
          })
          totalSynced++
        }
      } catch (error: any) {
        console.error('Erro ao processar plataforma:', error)
        results.push({
          platform: platform.platform,
          post_id: platform.platform_post_id,
          status: 'error',
          error: error.message,
        })
        totalErrors++
      }
    }

    return NextResponse.json({
      success: true,
      idea_id: ideaId,
      platforms_synced: totalSynced,
      platforms_errors: totalErrors,
      results: results,
    })
  } catch (error: any) {
    console.error('Erro ao sincronizar metricas:', error)
    return NextResponse.json(
      { error: 'Erro interno', message: error.message },
      { status: 500 }
    )
  }
}
