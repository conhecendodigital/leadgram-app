import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      idea_platform_id,
      views = 0,
      likes = 0,
      comments = 0,
      shares = 0,
      saves = 0,
      reach = 0,
      impressions = 0,
      source = 'manual',
    } = body

    // Validação
    if (!idea_platform_id) {
      return NextResponse.json(
        { error: 'idea_platform_id is required' },
        { status: 400 }
      )
    }

    // Calcular engagement rate
    const totalEngagement = likes + comments + shares + saves
    const engagement_rate = impressions > 0 ? (totalEngagement / impressions) * 100 : 0

    // Criar métrica
    const { data: metric, error } = await (supabase
      .from('metrics') as any)
      .insert({
        idea_platform_id,
        views,
        likes,
        comments,
        shares,
        saves,
        reach,
        impressions,
        engagement_rate,
        source,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Error creating metric:', error)
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    )
  }
}
