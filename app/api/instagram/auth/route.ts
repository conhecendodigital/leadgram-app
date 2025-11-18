import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function GET() {
  const supabase = await createServerClient()

  // Verificar autenticação (opcional - pode permitir que não-autenticados iniciem OAuth)
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // Gerar state aleatório para proteção CSRF
  const state = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutos

  // Salvar state no banco (temporário)
  try {
    await (supabase.from('oauth_states') as any).insert({
      state,
      user_id: user?.id || null, // null se não autenticado
      provider: 'instagram',
      expires_at: expiresAt.toISOString(),
    })

    console.log('✅ OAuth state created:', state.substring(0, 10) + '...')
  } catch (error) {
    console.error('❌ Failed to save OAuth state:', error)
    return NextResponse.json(
      { error: 'Failed to initialize OAuth flow' },
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

  // Usar state aleatório (CSRF protection)
  authUrl.searchParams.set('state', state)

  return NextResponse.redirect(authUrl.toString())
}
