import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getIdeaLimit } from '@/lib/settings'
import { extractInstagramPostId, normalizeInstagramUrl } from '@/lib/instagram-helpers'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: ideas, error } = await (supabase
      .from('ideas') as any)
      .select(`
        *,
        platforms:idea_platforms(
          id,
          platform,
          platform_post_id,
          post_url,
          posted_at,
          is_posted,
          metrics(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(ideas)
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, theme, script, editor_instructions, status, funnel_stage, platforms, platform_urls, thumbnail_url, video_url } = body

    // Validação
    if (!title || !funnel_stage) {
      return NextResponse.json(
        { error: 'Title and funnel_stage are required' },
        { status: 400 }
      )
    }

    // Verificar plano do usuário
    const { data: subscription } = await (supabase
      .from('user_subscriptions') as any)
      .select('plan_type')
      .eq('user_id', user.id)
      .single()

    const planType = subscription?.plan_type || 'free'

    // Contar ideias do usuário
    const { count: currentIdeasCount } = await (supabase
      .from('ideas') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Verificar limite de ideias
    const ideaLimit = await getIdeaLimit(planType)

    if (ideaLimit !== -1 && currentIdeasCount !== null && currentIdeasCount >= ideaLimit) {
      return NextResponse.json(
        {
          error: 'Limite de ideias atingido',
          message: `Seu plano ${planType} permite apenas ${ideaLimit} ideias. Faça upgrade para criar mais ideias.`,
          limit: ideaLimit,
          current: currentIdeasCount,
          planType,
        },
        { status: 403 }
      )
    }

    // Criar ideia
    const { data: idea, error: ideaError } = await (supabase
      .from('ideas') as any)
      .insert({
        user_id: user.id,
        title,
        theme: theme || null,
        script: script || null,
        editor_instructions: editor_instructions || null,
        status: status || 'idea',
        funnel_stage,
        thumbnail_url: thumbnail_url || null,
        video_url: video_url || null,
      })
      .select()
      .single()

    if (ideaError) throw ideaError

    // Criar plataformas associadas
    if (platforms && platforms.length > 0) {
      const platformsData = platforms.map((platform: string) => {
        const platformData: any = {
          idea_id: idea.id,
          platform,
          is_posted: status === 'posted',
        }

        // Se tiver URL da plataforma, processar
        if (platform_urls && platform_urls[platform]) {
          const url = platform_urls[platform]
          platformData.post_url = normalizeInstagramUrl(url) || url

          // Se for Instagram, extrair post ID
          if (platform === 'instagram') {
            const postId = extractInstagramPostId(url)
            if (postId) {
              platformData.platform_post_id = postId
            }
          }

          // Se status é posted e tem URL, marcar como postado
          if (status === 'posted') {
            platformData.posted_at = new Date().toISOString()
          }
        }

        return platformData
      })

      const { error: platformsError } = await supabase
        .from('idea_platforms')
        .insert(platformsData)

      if (platformsError) throw platformsError
    }

    return NextResponse.json(idea, { status: 201 })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}
