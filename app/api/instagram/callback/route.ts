import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  console.log('📱 Instagram Callback:', { code: !!code, state: !!state, error })

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

  if (!state) {
    console.error('❌ No state provided - possible CSRF attack')
    return NextResponse.redirect(
      new URL('/dashboard/instagram?error=csrf_missing', request.url)
    )
  }

  try {
    const supabase = await createServerClient()

    // BUG #5 FIX: Marcar state como usado ATOMICAMENTE para prevenir replay attacks
    // Fazer update e select em uma única operação
    const { data: savedState, error: stateError } = await (supabase
      .from('oauth_states') as any)
      .update({ used: true })
      .eq('state', state)
      .eq('provider', 'instagram')
      .eq('used', false)
      .select()
      .single()

    if (stateError || !savedState) {
      console.error('❌ Invalid or already used state - possible CSRF/replay attack:', stateError)
      return NextResponse.redirect(
        new URL('/dashboard/instagram?error=csrf_invalid', request.url)
      )
    }

    // Verificar se expirou DEPOIS de marcar como usado
    if (new Date(savedState.expires_at) < new Date()) {
      console.error('❌ Expired state')
      await (supabase.from('oauth_states') as any).delete().eq('id', savedState.id)
      return NextResponse.redirect(
        new URL('/dashboard/instagram?error=csrf_expired', request.url)
      )
    }

    console.log('✅ OAuth state validated successfully')

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ No user:', authError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('🔑 Trocando code por access_token...')

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      throw new Error('NEXT_PUBLIC_FACEBOOK_APP_ID não configurado')
    }
    if (!process.env.FACEBOOK_APP_SECRET) {
      throw new Error('FACEBOOK_APP_SECRET não configurado')
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL não configurado')
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`
    console.log('📍 Redirect URI:', redirectUri)

    // PASSO 1: Trocar code por Facebook access_token
    console.log('🔑 Passo 1: Trocando code por Facebook token...')
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID)
    tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('❌ Facebook token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        redirectUri,
      })
      throw new Error(
        `Failed to exchange code for token: ${errorData.error?.message || errorData.error || 'Unknown error'}`
      )
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Facebook token received')

    // PASSO 2: Trocar por long-lived Facebook token
    console.log('🔑 Passo 2: Trocando por long-lived token...')
    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token')
    longLivedUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID)
    longLivedUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET)
    longLivedUrl.searchParams.set('fb_exchange_token', tokenData.access_token)

    const longLivedResponse = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedResponse.json()
    const fbToken = longLivedData.access_token || tokenData.access_token
    const expiresIn = longLivedData.expires_in || 3600

    console.log('✅ Long-lived Facebook token received')

    // PASSO 3: Buscar Facebook Pages do usuário
    console.log('📄 Passo 3: Buscando Facebook Pages...')
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${fbToken}`
    )

    const pagesData = await pagesResponse.json()

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('❌ Nenhuma página do Facebook encontrada')
      throw new Error('Você precisa ter uma Página do Facebook para conectar o Instagram Business')
    }

    console.log(`✅ Encontrou ${pagesData.data.length} página(s) do Facebook`)

    // PASSO 4: Encontrar qual page tem Instagram Business conectado
    console.log('📱 Passo 4: Procurando Instagram Business nas páginas...')
    let instagramAccount = null
    let pageAccessToken = null

    for (const page of pagesData.data) {
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )
      const igData = await igResponse.json()

      if (igData.instagram_business_account) {
        instagramAccount = igData.instagram_business_account
        pageAccessToken = page.access_token
        console.log(`✅ Instagram Business encontrado na página: ${page.name}`)
        break
      }
    }

    if (!instagramAccount) {
      console.error('❌ Nenhuma conta Instagram Business conectada às páginas')
      throw new Error('Nenhuma conta Instagram Business encontrada. Conecte seu Instagram à sua Página do Facebook')
    }

    // PASSO 5: Buscar dados do Instagram Business Account
    console.log('👤 Passo 5: Buscando dados do perfil Instagram...')
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccount.id}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${pageAccessToken}`
    )

    const profileData = await profileResponse.json()
    console.log('✅ Dados do perfil:', {
      username: profileData.username,
      id: profileData.id,
      followers: profileData.followers_count,
      following: profileData.follows_count,
      posts: profileData.media_count
    })

    // PASSO 6: Converter Page Access Token em Instagram Long-Lived Access Token (60 dias)
    console.log('🔑 Passo 6: Convertendo para Instagram Long-Lived Token...')

    // Instagram Graph API aceita o Page Access Token diretamente
    // Mas vamos garantir que temos um long-lived token
    let finalToken = pageAccessToken
    let tokenExpiresIn = 60 * 24 * 60 * 60 // 60 dias em segundos

    try {
      // Tentar obter um long-lived Instagram token
      const longLivedIgUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.FACEBOOK_APP_SECRET}&access_token=${pageAccessToken}`
      const longLivedIgResponse = await fetch(longLivedIgUrl)

      if (longLivedIgResponse.ok) {
        const longLivedIgData = await longLivedIgResponse.json()
        if (longLivedIgData.access_token) {
          finalToken = longLivedIgData.access_token
          tokenExpiresIn = longLivedIgData.expires_in || tokenExpiresIn
          console.log('✅ Instagram Long-Lived Token obtido (válido por', Math.floor(tokenExpiresIn / (24 * 60 * 60)), 'dias)')
        }
      } else {
        console.log('⚠️ Não foi possível obter Long-Lived Token, usando Page Access Token')
      }
    } catch (error) {
      console.error('⚠️ Erro ao obter Long-Lived Token:', error)
      console.log('Usando Page Access Token como fallback')
    }

    // Desativar contas antigas
    await (supabase
      .from('instagram_accounts') as any)
      .update({ is_active: false })
      .eq('user_id', user.id)

    // PASSO 7: Salvar no banco de dados
    console.log('💾 Passo 7: Salvando dados no banco...')

    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + (tokenExpiresIn * 1000))
    console.log('📅 Token expira em:', expiresAt.toLocaleString('pt-BR'))

    // Inserir nova conexão
    const { data: account, error: insertError } = await (supabase
      .from('instagram_accounts') as any)
      .insert({
        user_id: user.id,
        username: profileData.username,
        instagram_user_id: profileData.id,
        access_token: finalToken,
        profile_picture_url: profileData.profile_picture_url || null,
        followers_count: profileData.followers_count || 0,
        follows_count: profileData.follows_count || 0,
        media_count: profileData.media_count || 0,
        token_expires_at: expiresAt.toISOString(),
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
