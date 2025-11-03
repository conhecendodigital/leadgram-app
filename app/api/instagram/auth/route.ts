import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!appId) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_FACEBOOK_APP_ID not configured' },
      { status: 500 }
    )
  }

  if (!appUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_APP_URL not configured' },
      { status: 500 }
    )
  }

  // IMPORTANTE: Este redirect_uri DEVE ser IDÊNTICO ao usado em callback/route.ts
  const redirectUri = `${appUrl}/api/instagram/callback`

  console.log('🔐 Instagram Auth - Redirect URI:', redirectUri)

  // Facebook Login OAuth URL
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')

  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')

  // Permissões necessárias para Instagram
  authUrl.searchParams.set('scope', [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
    'business_management'
  ].join(','))

  authUrl.searchParams.set('state', 'random_string_for_security')

  return NextResponse.redirect(authUrl.toString())
}
