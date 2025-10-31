import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/instagram?error=${error}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/instagram?error=no_code', request.url)
    )
  }

  try {
    const supabase = await createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 1. Trocar código por access token do Facebook
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!)
    tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET!)
    tokenUrl.searchParams.set('redirect_uri', process.env.FACEBOOK_REDIRECT_URI!)
    tokenUrl.searchParams.set('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Facebook token error:', errorData)
      return NextResponse.redirect(
        new URL('/dashboard/instagram?error=token_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. Buscar páginas do Facebook conectadas
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    )
    const pagesData = await pagesResponse.json()

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(
        new URL('/dashboard/instagram?error=no_pages', request.url)
      )
    }

    // 3. Para cada página, verificar se tem Instagram Business conectado
    let instagramAccountData: any = null

    for (const page of pagesData.data) {
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )
      const igData = await igResponse.json()

      if (igData.instagram_business_account) {
        // 4. Buscar dados do Instagram
        const igAccountResponse = await fetch(
          `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${page.access_token}`
        )
        instagramAccountData = await igAccountResponse.json()
        instagramAccountData.access_token = page.access_token
        instagramAccountData.page_id = page.id
        break
      }
    }

    if (!instagramAccountData) {
      return NextResponse.redirect(
        new URL('/dashboard/instagram?error=no_instagram_account', request.url)
      )
    }

    // 5. Salvar no banco de dados
    const insertData: Database['public']['Tables']['instagram_accounts']['Insert'] = {
      user_id: session.user.id,
      instagram_user_id: String(instagramAccountData.id),
      username: instagramAccountData.username,
      access_token: instagramAccountData.access_token,
      account_type: 'BUSINESS',
      followers_count: Number(instagramAccountData.followers_count) || 0,
      follows_count: Number(instagramAccountData.follows_count) || 0,
      media_count: Number(instagramAccountData.media_count) || 0,
      profile_picture_url: instagramAccountData.profile_picture_url || null,
      connected_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
      is_active: true,
    }

    const { error: dbError } = await (supabase
      .from('instagram_accounts') as any)
      .upsert(insertData)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(
        new URL('/dashboard/instagram?error=database', request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/dashboard/instagram?success=true', request.url)
    )
  } catch (error) {
    console.error('Instagram callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/instagram?error=unknown', request.url)
    )
  }
}
