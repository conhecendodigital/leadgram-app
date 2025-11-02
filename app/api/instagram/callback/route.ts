import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  console.log('📱 Instagram Callback:', { code: !!code, error })

  if (error) {
    console.error('❌ Instagram error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard/instagram?error=${error}`, request.url)
    )
  }

  if (!code) {
    console.error('❌ No code provided')
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
      console.error('❌ No session')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('🔑 Trocando code por access_token...')

    // Trocar code por access_token
    const tokenResponse = await fetch(
      'https://api.instagram.com/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          client_secret: process.env.FACEBOOK_APP_SECRET!,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`,
          code,
        }),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('❌ Token exchange failed:', errorData)
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Token received:', { user_id: tokenData.user_id })

    // Buscar long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.FACEBOOK_APP_SECRET}&access_token=${tokenData.access_token}`
    )

    const longLivedData = await longLivedResponse.json()
    const finalToken = longLivedData.access_token || tokenData.access_token
    const expiresIn = longLivedData.expires_in || 3600

    console.log('🔐 Long-lived token received')

    // Buscar dados do perfil
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${finalToken}`
    )

    const profileData = await profileResponse.json()
    console.log('👤 Profile data:', profileData)

    // Desativar contas antigas
    await (supabase
      .from('instagram_accounts') as any)
      .update({ is_active: false })
      .eq('user_id', session.user.id)

    // Inserir nova conexão
    const { data: account, error: insertError } = await (supabase
      .from('instagram_accounts') as any)
      .insert({
        user_id: session.user.id,
        username: profileData.username,
        instagram_user_id: profileData.id,
        access_token: finalToken,
        media_count: profileData.media_count || 0,
        token_expires_at: new Date(
          Date.now() + expiresIn * 1000
        ).toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Database error:', insertError)
      throw new Error(`Database error: ${insertError.message}`)
    }

    console.log('✅ Account saved:', account.id)

    return NextResponse.redirect(
      new URL('/dashboard/instagram?success=true', request.url)
    )
  } catch (error: any) {
    console.error('❌ Callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/dashboard/instagram?error=${encodeURIComponent(error.message)}`,
        request.url
      )
    )
  }
}
