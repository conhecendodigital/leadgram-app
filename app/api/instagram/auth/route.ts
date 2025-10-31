import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'Facebook credentials not configured' },
      { status: 500 }
    )
  }

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
