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
    // impressions = total de visualizações do conteúdo
    // reach = contas únicas que viram o conteúdo
    // follower_count = número de seguidores
    const accountMetricsUrl = new URL(
      `https://graph.facebook.com/v18.0/${validAccount.instagram_user_id}/insights`
    )
    accountMetricsUrl.searchParams.set('metric', 'impressions,reach,follower_count')
    accountMetricsUrl.searchParams.set('period', 'day')
    accountMetricsUrl.searchParams.set('since', since.toString())
    accountMetricsUrl.searchParams.set('until', until.toString())
    accountMetricsUrl.searchParams.set('access_token', validAccount.access_token)

    console.log('🔍 Buscando métricas gerais...')
    let accountMetrics: any = { data: [] }

    try {
      const accountMetricsResponse = await fetch(accountMetricsUrl.toString())

      if (!accountMetricsResponse.ok) {
        const error = await accountMetricsResponse.json()
        console.error('⚠️ Erro ao buscar métricas da conta (continuando com posts):', {
          status: accountMetricsResponse.status,
          error: error.error?.message || error.message || 'Erro desconhecido',
        })
        // Não retorna erro - continua para buscar posts
      } else {
        accountMetrics = await accountMetricsResponse.json()
        console.log('✅ Métricas gerais recebidas')
      }
    } catch (metricsError) {
      console.error('⚠️ Exceção ao buscar métricas da conta:', metricsError)
      // Continua para buscar posts
    }

    // PASSO 2: Buscar TODOS os posts (com paginação)
    // IMPORTANTE: Buscar posts SEM insights primeiro para garantir que todos são retornados
    // Alguns posts podem não ter insights disponíveis e seriam omitidos se pedíssemos junto
    let posts: any[] = []
    let nextPageUrl: string | null = null

    // Primeira requisição - busca básica sem insights
    const initialPostsUrl = new URL(
      `https://graph.facebook.com/v18.0/${validAccount.instagram_user_id}/media`
    )
    initialPostsUrl.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count')
    initialPostsUrl.searchParams.set('limit', '100') // Máximo permitido pela API
    initialPostsUrl.searchParams.set('access_token', validAccount.access_token)

    console.log('📱 Buscando todos os posts...')

    // Função para buscar uma página de posts
    const fetchPostsPage = async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro ao buscar posts:', errorData)
        return { data: [], paging: null }
      }
      return response.json()
    }

    // Buscar primeira página
    let postsData = await fetchPostsPage(initialPostsUrl.toString())
    posts = postsData.data || []
    nextPageUrl = postsData.paging?.next || null

    // Continuar buscando enquanto houver mais páginas (sem limite)
    let pageCount = 1
    const maxPages = 50 // Aumentado para suportar até ~5000 posts

    while (nextPageUrl && pageCount < maxPages) {
      console.log(`📱 Buscando página ${pageCount + 1} de posts...`)
      postsData = await fetchPostsPage(nextPageUrl)

      if (postsData.data && postsData.data.length > 0) {
        posts = [...posts, ...postsData.data]
        console.log(`   📥 +${postsData.data.length} posts (total: ${posts.length})`)
      }

      nextPageUrl = postsData.paging?.next || null
      pageCount++

      // Se não houver mais páginas, sair do loop
      if (!nextPageUrl) {
        console.log(`📄 Fim da paginação - todas as páginas carregadas`)
        break
      }
    }

    console.log(`✅ ${posts.length} posts recebidos no total (${pageCount} página(s))`)

    // Debug: verificar se todos os posts têm ID
    const postsWithId = posts.filter((p: any) => p.id)
    console.log(`📊 Posts com ID válido: ${postsWithId.length}/${posts.length}`)

    // PASSO 2.5: Buscar insights para cada post em batches
    // Fazemos isso separadamente para não perder posts que não têm insights
    console.log('📈 Buscando insights individuais dos posts...')

    const postsWithInsights = new Map<string, any>()
    const BATCH_SIZE = 50 // Processar 50 posts por vez para não sobrecarregar

    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE)

      // Buscar insights em paralelo para o batch
      const insightsPromises = batch.map(async (post: any) => {
        try {
          const insightsUrl = `https://graph.facebook.com/v18.0/${post.id}/insights?metric=impressions,reach,saved&access_token=${validAccount.access_token}`
          const response = await fetch(insightsUrl)

          if (response.ok) {
            const data = await response.json()
            return { postId: post.id, insights: data.data || [] }
          }
          return { postId: post.id, insights: [] }
        } catch {
          return { postId: post.id, insights: [] }
        }
      })

      const batchResults = await Promise.all(insightsPromises)
      batchResults.forEach(result => {
        postsWithInsights.set(result.postId, result.insights)
      })

      console.log(`   📊 Processado batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(posts.length / BATCH_SIZE)}`)
    }

    console.log(`✅ Insights obtidos para ${postsWithInsights.size} posts`)

    // PASSO 3: Calcular métricas agregadas
    const totalPosts = posts.length
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0)
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0)

    // Calcular total de impressions e reach dos posts usando o Map de insights
    const totalPostImpressions = posts.reduce((sum: number, post: any) => {
      const insights = postsWithInsights.get(post.id) || []
      const impressions = insights.find((i: any) => i.name === 'impressions')
      return sum + (impressions?.values?.[0]?.value || 0)
    }, 0)

    const totalPostReach = posts.reduce((sum: number, post: any) => {
      const insights = postsWithInsights.get(post.id) || []
      const reach = insights.find((i: any) => i.name === 'reach')
      return sum + (reach?.values?.[0]?.value || 0)
    }, 0)

    const totalEngagement = totalLikes + totalComments
    const engagementRate = validAccount.followers_count > 0 && totalPosts > 0
      ? ((totalEngagement / totalPosts) / validAccount.followers_count) * 100
      : 0

    // PASSO 4: Processar dados diários (últimos 30 dias)
    // Dados da API de métricas da CONTA (não dos posts individuais)
    const dailyData: any[] = []

    if (accountMetrics.data && accountMetrics.data.length > 0) {
      // Processar métricas disponíveis por dia
      const impressionsMetric = accountMetrics.data.find((m: any) => m.name === 'impressions')
      const reachMetric = accountMetrics.data.find((m: any) => m.name === 'reach')
      const followerMetric = accountMetrics.data.find((m: any) => m.name === 'follower_count')

      // Usar a métrica que tiver mais dados como base
      const baseMetric = reachMetric || impressionsMetric || followerMetric

      if (baseMetric?.values) {
        baseMetric.values.forEach((value: any, index: number) => {
          const dateStr = value.end_time?.split('T')[0] || new Date().toISOString().split('T')[0]
          dailyData.push({
            date: dateStr,
            // Métricas da CONTA (diárias reais do Instagram)
            impressions: impressionsMetric?.values?.[index]?.value || 0,
            reach: reachMetric?.values?.[index]?.value || 0,
            follower_count: followerMetric?.values?.[index]?.value || 0,
          })
        })
      }

      console.log(`📊 Dados diários processados: ${dailyData.length} dias`)
      console.log(`   - Impressões disponíveis: ${impressionsMetric ? 'Sim' : 'Não'}`)
      console.log(`   - Alcance disponível: ${reachMetric ? 'Sim' : 'Não'}`)
      console.log(`   - Seguidores disponível: ${followerMetric ? 'Sim' : 'Não'}`)
    }

    // Se não houver dados diários da API, criar estrutura baseada nos últimos 30 dias
    if (dailyData.length === 0) {
      console.log('⚠️ Sem dados de métricas de conta, criando estrutura baseada em datas')
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dailyData.push({
          date: dateStr,
          impressions: 0,
          reach: 0,
          follower_count: validAccount.followers_count || 0,
        })
      }
    }

    // Agregar likes, comentários e métricas dos posts por dia de PUBLICAÇÃO
    // (para os gráficos de engajamento, curtidas, comentários, impressões e alcance)
    const postsByDay = new Map<string, { likes: number; comments: number; impressions: number; reach: number; posts_count: number }>()

    posts.forEach((post: any) => {
      if (post.timestamp) {
        const dateStr = post.timestamp.split('T')[0]
        const existing = postsByDay.get(dateStr) || { likes: 0, comments: 0, impressions: 0, reach: 0, posts_count: 0 }

        // Buscar impressões e reach do post no Map de insights
        const postInsights = postsWithInsights.get(post.id) || []
        const postImpressions = postInsights.find((i: any) => i.name === 'impressions')?.values?.[0]?.value || 0
        const postReach = postInsights.find((i: any) => i.name === 'reach')?.values?.[0]?.value || 0

        postsByDay.set(dateStr, {
          likes: existing.likes + (post.like_count || 0),
          comments: existing.comments + (post.comments_count || 0),
          impressions: existing.impressions + postImpressions,
          reach: existing.reach + postReach,
          posts_count: existing.posts_count + 1,
        })
      }
    })

    // Adicionar dados de engajamento dos posts aos dados diários
    // Se métricas de conta não disponíveis, usar dados dos posts
    dailyData.forEach((day: any) => {
      const postData = postsByDay.get(day.date)
      if (postData) {
        day.likes = postData.likes
        day.comments = postData.comments
        day.posts_count = postData.posts_count
        // Usar impressões/reach dos posts se a métrica de conta for 0
        if ((day.impressions === 0 || day.impressions === undefined) && postData.impressions > 0) {
          day.impressions = postData.impressions
        }
        if ((day.reach === 0 || day.reach === undefined) && postData.reach > 0) {
          day.reach = postData.reach
        }
      } else {
        day.likes = 0
        day.comments = 0
        day.posts_count = 0
      }
    })

    // PASSO 5: Processar TODOS os posts com métricas
    // media_type: IMAGE, VIDEO, CAROUSEL_ALBUM
    // VIDEO = Reels, IMAGE/CAROUSEL_ALBUM = Feed
    console.log(`📊 Processando ${posts.length} posts para métricas...`)

    const allPosts = posts
      .map((post: any) => {
        // Buscar insights do Map
        const insights = postsWithInsights.get(post.id) || []
        const impressions = insights.find((i: any) => i.name === 'impressions')?.values?.[0]?.value || 0
        const reach = insights.find((i: any) => i.name === 'reach')?.values?.[0]?.value || 0
        const saved = insights.find((i: any) => i.name === 'saved')?.values?.[0]?.value || 0

        // Calcular engagement manualmente: likes + comments
        const likes = post.like_count || 0
        const comments = post.comments_count || 0
        const engagement = likes + comments

        // Determinar categoria: feed (IMAGE, CAROUSEL_ALBUM) ou reels (VIDEO)
        const mediaType = post.media_type || 'IMAGE'
        const category = mediaType === 'VIDEO' ? 'reels' : 'feed'

        return {
          id: post.id,
          caption: post.caption?.substring(0, 100) || '',
          media_url: post.media_url || post.thumbnail_url,
          thumbnail_url: post.thumbnail_url || post.media_url,
          permalink: post.permalink,
          timestamp: post.timestamp,
          media_type: mediaType,
          category, // 'feed' ou 'reels'
          likes,
          comments,
          impressions,
          reach,
          engagement,
          saved,
          engagement_rate: reach > 0 ? (engagement / reach) * 100 : 0,
        }
      })
      .sort((a: any, b: any) => b.engagement - a.engagement)

    console.log(`✅ ${allPosts.length} posts processados com sucesso`)

    // Separar por categoria para estatísticas
    const feedPosts = allPosts.filter((p: any) => p.category === 'feed')
    const reelsPosts = allPosts.filter((p: any) => p.category === 'reels')

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
        // Estatísticas por categoria
        feed_count: feedPosts.length,
        reels_count: reelsPosts.length,
      },
      daily_data: dailyData,
      // Retornar TODOS os posts (não mais limitado a 10)
      top_posts: allPosts,
      // Posts separados por categoria (opcional, para facilitar)
      feed_posts: feedPosts,
      reels_posts: reelsPosts,
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

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ Erro ao buscar insights:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar insights', message: error.message },
      { status: 500 }
    )
  }
}
