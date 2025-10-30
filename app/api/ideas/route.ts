import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: ideas, error } = await supabase
      .from('ideas')
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
    const { title, theme, script, editor_instructions, status, funnel_stage, platforms } = body

    // Validação
    if (!title || !funnel_stage) {
      return NextResponse.json(
        { error: 'Title and funnel_stage are required' },
        { status: 400 }
      )
    }

    // Criar ideia
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
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

    // Criar plataformas associadas
    if (platforms && platforms.length > 0) {
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

    return NextResponse.json(idea, { status: 201 })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}
