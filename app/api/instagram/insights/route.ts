import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/instagram/insights
 *
 * Busca insights/métricas da conta Instagram Business
 * Métricas disponíveis:
 * - impressions: visualizações totais
 * - reach: contas únicas alcançadas
 * - profile_views: visualizações do perfil
 * - follower_count: número de seguidores
 * - website_clicks: cliques no link da bio
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar conta Instagram conectada
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Nenhuma conta Instagram conectada' },
        { status: 404 }
      )
    }

    // Type assertion para TypeScript
    const validAccount = account as { username: string; instagram_user_id: string; access_token: string; followers_count: number; [key: string]: any }

    console.log('📊 Buscando insights para:', validAccount.username)

    // Buscar insights dos últimos 30 dias
    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 // 30 dias atrás
    const until = Math.floor(Date.now() / 1000)

    // PASSO 1: Buscar insights da conta (métricas gerais)
    // Métricas permitidas pela API do Facebook Instagram Insights
    const accountMetricsUrl = new URL(
      `https://graph.facebook.com/v18.0/${validAccount.instagram_user_id}/insights`
    )
    accountMetricsUrl.searchParams.set('metric', 'reach,follower_count')
    accountMetricsUrl.searchParams.set('period', 'day')
    accountMetricsUrl.searchParams.set('since', since.toString())
    accountMetricsUrl.searchParams.set('until', until.toString())
    accountMetricsUrl.searchParams.set('access_token', validAccount.access_token)

    console.log('🔍 Buscando métricas gerais...')
    const accountMetricsResponse = await fetch(accountMetricsUrl.toString())

    if (!accountMetricsResponse.ok) {
      const error = await accountMetricsResponse.json()
      console.error('❌ Erro ao buscar métricas da API do Facebook:', {
        status: accountMetricsResponse.status,
        error: error,
        url: accountMetricsUrl.toString().replace(validAccount.access_token, 'TOKEN_HIDDEN'),
      })

      // Retornar erro detalhado para o cliente
      return NextResponse.json(
        {
          error: 'Erro ao buscar insights da API do Facebook',
          details: error.error?.message || error.message || 'Erro desconhecido',
          error_code: error.error?.code || 'unknown',
          type: error.error?.type || 'unknown',
          fbtrace_id: error.error?.fbtrace_id || null,
        },
        { status: accountMetricsResponse.status }
      )
    }

    const accountMetrics = await accountMetricsResponse.json()
    console.log('✅ Métricas gerais recebidas:', accountMetrics.data?.length || 0, 'métricas')
    console.log('📊 Métricas disponíveis:', accountMetrics.data?.map((m: any) => m.name).join(', '))

    // PASSO 2: Buscar posts recentes com métricas
    const postsUrl = new URL(
      `https://graph.facebook.com/v18.0/${validAccount.instagram_user_id}/media`
    )
    postsUrl.searchParams.set('fields', 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,insights.metric(impressions,reach,engagement,saved)')
    postsUrl.searchParams.set('limit', '50')
    postsUrl.searchParams.set('access_token', validAccount.access_token)

    console.log('📱 Buscando posts com insights...')
    const postsResponse = await fetch(postsUrl.toString())

    let posts = []
    if (postsResponse.ok) {
      const postsData = await postsResponse.json()
      posts = postsData.data || []
      console.log(`✅ ${posts.length} posts recebidos`)
      if (posts.length > 0) {
        console.log('📊 Exemplo de post:', JSON.stringify(posts[0], null, 2))
      }
    } else {
      const errorData = await postsResponse.json()
      console.error('❌ Erro ao buscar posts:', errorData)
    }

    // PASSO 3: Calcular métricas agregadas
    const totalPosts = posts.length
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0)
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0)

    // Calcular total de impressions e reach dos posts
    const totalPostImpressions = posts.reduce((sum: number, post: any) => {
      const impressions = post.insights?.data?.find((i: any) => i.name === 'impressions')
      return sum + (impressions?.values?.[0]?.value || 0)
    }, 0)

    const totalPostReach = posts.reduce((sum: number, post: any) => {
      const reach = post.insights?.data?.find((i: any) => i.name === 'reach')
      return sum + (reach?.values?.[0]?.value || 0)
    }, 0)

    const totalEngagement = totalLikes + totalComments
    const engagementRate = validAccount.followers_count > 0 && totalPosts > 0
      ? ((totalEngagement / totalPosts) / validAccount.followers_count) * 100
      : 0

    // PASSO 4: Processar dados diários (últimos 30 dias)
    const dailyData: any[] = []

    if (accountMetrics.data && accountMetrics.data.length > 0) {
      // Processar métricas disponíveis por dia
      const reachMetric = accountMetrics.data.find((m: any) => m.name === 'reach')
      const followerMetric = accountMetrics.data.find((m: any) => m.name === 'follower_count')

      if (reachMetric?.values) {
        reachMetric.values.forEach((value: any, index: number) => {
          dailyData.push({
            date: value.end_time,
            reach: value.value || 0,
            follower_count: followerMetric?.values?.[index]?.value || 0,
          })
        })
      }
    }

    // PASSO 5: Identificar top posts
    const topPosts = posts
      .map((post: any) => {
        const impressions = post.insights?.data?.find((i: any) => i.name === 'impressions')?.values?.[0]?.value || 0
        const reach = post.insights?.data?.find((i: any) => i.name === 'reach')?.values?.[0]?.value || 0
        const engagement = post.insights?.data?.find((i: any) => i.name === 'engagement')?.values?.[0]?.value || 0

        return {
          id: post.id,
          caption: post.caption?.substring(0, 100) || '',
          media_url: post.media_url,
          permalink: post.permalink,
          timestamp: post.timestamp,
          likes: post.like_count || 0,
          comments: post.comments_count || 0,
          impressions,
          reach,
          engagement,
          engagement_rate: reach > 0 ? (engagement / reach) * 100 : 0,
        }
      })
      .sort((a: any, b: any) => b.engagement - a.engagement)
      .slice(0, 10)

    // PASSO 6: Calcular crescimento de seguidores (aproximado)
    const followerGrowth = dailyData.length > 1 && dailyData[0].follower_count && dailyData[dailyData.length - 1].follower_count
      ? dailyData[dailyData.length - 1].follower_count - dailyData[0].follower_count
      : 0

    // Resposta final
    const response = {
      success: true,
      account: {
        username: validAccount.username,
        followers: validAccount.followers_count,
        following: validAccount.follows_count,
        posts: validAccount.media_count,
      },
      summary: {
        total_posts: totalPosts,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_impressions: totalPostImpressions,
        total_reach: totalPostReach,
        engagement_rate: isNaN(engagementRate) ? 0 : parseFloat(engagementRate.toFixed(2)),
        follower_growth: followerGrowth,
      },
      daily_data: dailyData,
      top_posts: topPosts,
      raw_metrics: accountMetrics.data || [],
    }

    // PASSO 7: Salvar snapshot no banco para histórico
    await (supabase.from('instagram_insights') as any).insert({
      instagram_account_id: validAccount.id,
      date: new Date().toISOString().split('T')[0],
      impressions: totalPostImpressions, // De posts individuais
      reach: totalPostReach, // De posts individuais
      profile_views: 0, // Não disponível na API atual
      follower_count: validAccount.followers_count,
      engagement_rate: isNaN(engagementRate) ? 0 : parseFloat(engagementRate.toFixed(2)),
      total_likes: totalLikes,
      total_comments: totalComments,
    })

    console.log('✅ Insights processados e salvos')
    console.log('📤 Resumo:', {
      total_posts: response.summary.total_posts,
      total_impressions: response.summary.total_impressions,
      total_reach: response.summary.total_reach,
      engagement_rate: response.summary.engagement_rate,
      daily_data_count: response.daily_data.length,
      top_posts_count: response.top_posts.length,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ Erro ao buscar insights:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar insights', message: error.message },
      { status: 500 }
    )
  }
}
