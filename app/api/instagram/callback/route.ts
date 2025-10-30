import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/instagram?error=no_code', request.url))
    }

    // Trocar code por access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, user_id: instagram_user_id } = tokenData

    // Buscar informações do usuário
    const userInfoResponse = await fetch(
      `https://graph.instagram.com/${instagram_user_id}?fields=id,username,account_type,media_count&access_token=${access_token}`
    )

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const userInfo = await userInfoResponse.json()

    // Salvar no banco
    const { error } = await supabase.from('instagram_accounts').upsert({
      user_id: user.id,
      instagram_user_id: instagram_user_id.toString(),
      username: userInfo.username,
      access_token,
      account_type: userInfo.account_type,
      followers_count: 0,
      follows_count: 0,
      media_count: userInfo.media_count || 0,
      is_active: true,
      connected_at: new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.redirect(new URL('/dashboard/instagram', request.url))
  } catch (error) {
    console.error('Error in Instagram callback:', error)
    return NextResponse.redirect(new URL('/dashboard/instagram?error=callback_failed', request.url))
  }
}
