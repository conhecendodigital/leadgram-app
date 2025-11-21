import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getIdeaLimit } from '@/lib/settings'
import { GoogleDriveService } from '@/lib/services/google-drive-service'
import { withRateLimit, getRequestIdentifier } from '@/lib/api-middleware'

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

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting: 20 req/min por usuário
  const identifier = getRequestIdentifier(request, user.id)

  return withRateLimit(request, identifier, 20, 60, async () => {
    try {

    const body = await request.json()
    const { title, theme, script, editor_instructions, status, funnel_stage, platforms } = body

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
      })
      .select()
      .single()

    if (ideaError) throw ideaError

    // BUG #17 FIX: Validar plataformas antes de inserir
    const VALID_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook']

    if (platforms && platforms.length > 0) {
      // Validar plataformas
      const invalidPlatforms = platforms.filter((p: string) => !VALID_PLATFORMS.includes(p))
      if (invalidPlatforms.length > 0) {
        return NextResponse.json(
          { error: `Invalid platforms: ${invalidPlatforms.join(', ')}. Valid platforms are: ${VALID_PLATFORMS.join(', ')}` },
          { status: 400 }
        )
      }

      const platformsData = platforms.map((platform: string) => ({
        idea_id: idea.id,
        platform,
        is_posted: false,
      }))

      const { error: platformsError } = await supabase
        .from('idea_platforms')
        .insert(platformsData)

      if (platformsError) throw platformsError
    }

    // Criar subpasta no Google Drive automaticamente (se conectado)
    try {
      const driveService = new GoogleDriveService(supabase)
      const driveConnection = await driveService.getConnection(user.id)

      if (driveConnection && driveConnection.is_active) {
        console.log('📁 Criando subpasta no Google Drive para:', idea.title)

        // Criar pasta "Ideias" se não existir
        if (!driveConnection.folder_id) {
          await driveService.createIdeasFolder(user.id)
        }

        // Criar subpasta da ideia
        const folderId = await driveService.createIdeaFolder(user.id, idea.id, idea.title)
        console.log('✅ Subpasta criada com ID:', folderId)
      }
    } catch (driveError) {
      // Não falha a criação da ideia se houver erro no Drive
      console.error('⚠️ Erro ao criar subpasta no Drive:', driveError)
    }

      return NextResponse.json(idea, { status: 201 })
    } catch (error) {
      console.error('Error creating idea:', error)
      return NextResponse.json(
        { error: 'Failed to create idea' },
        { status: 500 }
      )
    }
  })
}
