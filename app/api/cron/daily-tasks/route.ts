import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Unified Daily Cron Job
 * Executes both Instagram sync and token refresh tasks
 * Runs once per day at 3:00 AM UTC
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const results = {
    tokensRefreshed: 0,
    tokenErrors: 0,
    instagramSynced: 0,
    instagramErrors: 0,
    timestamp: new Date().toISOString()
  }

  try {
    // ===== TASK 1: Refresh Instagram Tokens =====
    console.log('[CRON] Starting token refresh...')

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, instagram_user_id, instagram_access_token')
      .not('instagram_access_token', 'is', null)

    if (profilesError) {
      console.error('[CRON] Error fetching profiles:', profilesError)
      results.tokenErrors++
    } else if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        try {
          // Refresh long-lived token (expires in 60 days)
          const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${profile.instagram_access_token}`
          const refreshResponse = await fetch(refreshUrl)

          if (!refreshResponse.ok) {
            console.error(`[CRON] Failed to refresh token for user ${profile.id}`)
            results.tokenErrors++
            continue
          }

          const refreshData = await refreshResponse.json()

          // Update token in database
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              instagram_access_token: refreshData.access_token,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

          if (updateError) {
            console.error(`[CRON] Error updating token for user ${profile.id}:`, updateError)
            results.tokenErrors++
          } else {
            console.log(`[CRON] Token refreshed for user ${profile.id}`)
            results.tokensRefreshed++
          }
        } catch (error) {
          console.error(`[CRON] Exception refreshing token for user ${profile.id}:`, error)
          results.tokenErrors++
        }
      }
    }

    // ===== TASK 2: Sync Instagram Posts =====
    console.log('[CRON] Starting Instagram sync...')

    const { data: activeProfiles, error: activeProfilesError } = await supabase
      .from('profiles')
      .select('id, instagram_user_id, instagram_access_token')
      .not('instagram_access_token', 'is', null)

    if (activeProfilesError) {
      console.error('[CRON] Error fetching active profiles:', activeProfilesError)
      results.instagramErrors++
    } else if (activeProfiles && activeProfiles.length > 0) {
      for (const profile of activeProfiles) {
        try {
          // Fetch user's recent media from Instagram Graph API
          const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
          const instagramUrl = `https://graph.instagram.com/${profile.instagram_user_id}/media?fields=${fields}&access_token=${profile.instagram_access_token}&limit=50`

          const instagramResponse = await fetch(instagramUrl)

          if (!instagramResponse.ok) {
            console.error(`[CRON] Failed to fetch Instagram data for user ${profile.id}`)
            results.instagramErrors++
            continue
          }

          const instagramData = await instagramResponse.json()

          if (!instagramData.data || instagramData.data.length === 0) {
            console.log(`[CRON] No Instagram posts found for user ${profile.id}`)
            continue
          }

          // Bulk upsert posts (more efficient than individual queries)
          const postsToUpsert = instagramData.data.map((post: any) => ({
            user_id: profile.id,
            instagram_media_id: post.id,
            caption: post.caption || null,
            media_type: post.media_type,
            media_url: post.media_url,
            thumbnail_url: post.thumbnail_url || null,
            permalink: post.permalink,
            timestamp: post.timestamp,
            like_count: post.like_count || 0,
            comments_count: post.comments_count || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          const { error: upsertError } = await supabase
            .from('instagram_posts')
            .upsert(postsToUpsert, {
              onConflict: 'instagram_media_id',
              ignoreDuplicates: false
            })

          if (upsertError) {
            console.error(`[CRON] Error upserting posts for user ${profile.id}:`, upsertError)
            results.instagramErrors++
          } else {
            console.log(`[CRON] Synced ${instagramData.data.length} posts for user ${profile.id}`)
            results.instagramSynced++
          }
        } catch (error) {
          console.error(`[CRON] Exception syncing Instagram for user ${profile.id}:`, error)
          results.instagramErrors++
        }
      }
    }

    console.log('[CRON] Daily tasks completed:', results)

    return NextResponse.json({
      success: true,
      message: 'Daily tasks completed successfully',
      results
    })
  } catch (error) {
    console.error('[CRON] Fatal error in daily tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        results
      },
      { status: 500 }
    )
  }
}
