import { NextResponse } from 'next/server'

export async function GET() {
  // Instagram OAuth configuration
  const instagramAppId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`

  if (!instagramAppId) {
    return NextResponse.json(
      { error: 'Instagram App ID not configured' },
      { status: 500 }
    )
  }

  // Construir URL de autorização do Instagram
  const authUrl = new URL('https://api.instagram.com/oauth/authorize')
  authUrl.searchParams.append('client_id', instagramAppId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('scope', 'user_profile,user_media')
  authUrl.searchParams.append('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
