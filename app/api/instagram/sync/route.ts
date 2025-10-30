import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar conta Instagram do usuário
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Instagram account not found' },
        { status: 404 }
      )
    }

    // Buscar posts do Instagram
    const mediaResponse = await fetch(
      `https://graph.instagram.com/${account.instagram_user_id}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token=${account.access_token}`
    )

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch Instagram media')
    }

    const mediaData = await mediaResponse.json()

    // Salvar posts no banco
    if (mediaData.data && mediaData.data.length > 0) {
      for (const post of mediaData.data) {
        // Buscar insights (métricas detalhadas)
        let insights = {
          impressions: 0,
          reach: 0,
          saved: 0,
        }

        try {
          const insightsResponse = await fetch(
            `https://graph.instagram.com/${post.id}/insights?metric=impressions,reach,saved&access_token=${account.access_token}`
          )

          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json()
            insightsData.data?.forEach((metric: any) => {
              if (metric.name === 'impressions') insights.impressions = metric.values[0].value
              if (metric.name === 'reach') insights.reach = metric.values[0].value
              if (metric.name === 'saved') insights.saved = metric.values[0].value
            })
          }
        } catch (e) {
          console.warn('Failed to fetch insights for post', post.id)
        }

        // Calcular engagement rate
        const totalEngagement = (post.like_count || 0) + (post.comments_count || 0) + insights.saved
        const engagement_rate = insights.impressions > 0 ? (totalEngagement / insights.impressions) * 100 : 0

        // Upsert post
        await supabase.from('instagram_posts').upsert({
          instagram_account_id: account.id,
          instagram_media_id: post.id,
          media_type: post.media_type,
          caption: post.caption || null,
          permalink: post.permalink,
          thumbnail_url: post.thumbnail_url || post.media_url,
          timestamp: post.timestamp,
          like_count: post.like_count || 0,
          comments_count: post.comments_count || 0,
          impressions: insights.impressions,
          reach: insights.reach,
          saved: insights.saved,
          video_views: 0,
          engagement_rate,
          synced_at: new Date().toISOString(),
        })
      }
    }

    // Atualizar last_sync_at
    await supabase
      .from('instagram_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', account.id)

    return NextResponse.json({
      success: true,
      synced_posts: mediaData.data?.length || 0,
    })
  } catch (error) {
    console.error('Error syncing Instagram:', error)
    return NextResponse.json(
      { error: 'Failed to sync Instagram' },
      { status: 500 }
    )
  }
}
