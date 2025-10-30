import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: idea, error } = await supabase
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
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, theme, script, editor_instructions, status, funnel_stage, platforms } = body

    // Atualizar ideia
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .update({
        title,
        theme: theme || null,
        script: script || null,
        editor_instructions: editor_instructions || null,
        status,
        funnel_stage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (ideaError) throw ideaError

    // Atualizar plataformas (deletar antigas e criar novas)
    if (platforms) {
      // Deletar plataformas antigas
      await supabase
        .from('idea_platforms')
        .delete()
        .eq('idea_id', params.id)

      // Criar novas plataformas
      if (platforms.length > 0) {
        const platformsData = platforms.map((platform: string) => ({
          idea_id: idea.id,
          platform,
          is_posted: false,
        }))

        await supabase.from('idea_platforms').insert(platformsData)
      }
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deletar ideia (cascade vai deletar platforms e metrics)
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}
