import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar conta do Instagram conectada
    const { data: account, error: accountError } = await (supabase
      .from('instagram_accounts') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Nenhuma conta Instagram conectada' },
        { status: 400 }
      )
    }

    // Verificar se o token ainda é válido
    if (account.token_expires_at) {
      const expiresAt = new Date(account.token_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Token expirado. Reconecte sua conta.' },
          { status: 401 }
        )
      }
    }

    // Buscar posts do Instagram Graph API
    console.log('🔍 Iniciando sincronização do Instagram...')
    console.log('📊 Account info:', {
      id: account.id,
      username: account.username,
      instagram_user_id: account.instagram_user_id,
      token_expires_at: account.token_expires_at,
      is_active: account.is_active,
      token_length: account.access_token?.length || 0
    })

    // Instagram Graph API requer o Instagram User ID específico, não aceita /me
    // Deve usar graph.facebook.com (não graph.instagram.com) com versão da API
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.instagram_user_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${account.access_token}&limit=50`
    )

    console.log('📡 Instagram API response status:', instagramResponse.status)

    if (!instagramResponse.ok) {
      let errorData
      let errorMessage = 'Erro ao buscar posts do Instagram.'
      let isTokenError = false

      try {
        errorData = await instagramResponse.json()
        console.error('❌ Instagram API error:', JSON.stringify(errorData, null, 2))

        // Verificar tipos específicos de erro
        if (errorData.error) {
          const instagramError = errorData.error

          // Token expirado ou inválido
          if (instagramError.code === 190 || instagramError.type === 'OAuthException') {
            errorMessage = 'Token de acesso expirado ou inválido. Por favor, reconecte sua conta.'
            isTokenError = true
          }
          // Permissões insuficientes
          else if (instagramError.code === 10 || instagramError.code === 200) {
            errorMessage = 'Permissões insuficientes. Certifique-se de que sua conta é Business ou Creator.'
          }
          // Rate limit
          else if (instagramError.code === 4 || instagramError.code === 17) {
            errorMessage = 'Limite de requisições excedido. Aguarde alguns minutos e tente novamente.'
          }
          // Erro genérico com mensagem da API
          else if (instagramError.message) {
            errorMessage = `Instagram API: ${instagramError.message}`
          }
        }
      } catch (e) {
        console.error('Erro ao parsear resposta da API do Instagram:', e)
        errorMessage = `Erro HTTP ${instagramResponse.status} ao acessar Instagram API.`
      }

      // Se for erro de token, marcar conta como inativa
      if (isTokenError) {
        await (supabase
          .from('instagram_accounts') as any)
          .update({ is_active: false })
          .eq('id', account.id)
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData,
          status: instagramResponse.status
        },
        { status: isTokenError ? 401 : 500 }
      )
    }

    const instagramData = await instagramResponse.json()

    if (!instagramData.data || !Array.isArray(instagramData.data)) {
      return NextResponse.json(
        { error: 'Nenhum post encontrado' },
        { status: 404 }
      )
    }

    console.log(`📥 Processando ${instagramData.data.length} posts do Instagram...`)

    // OTIMIZAÇÃO: Buscar TODOS os posts existentes de uma vez (bulk query)
    const instagramMediaIds = instagramData.data.map((p: any) => p.id)

    const { data: existingPosts } = await (supabase
      .from('instagram_posts') as any)
      .select('id, instagram_media_id')
      .eq('instagram_account_id', account.id)
      .in('instagram_media_id', instagramMediaIds)

    console.log(`🔍 Encontrados ${existingPosts?.length || 0} posts já existentes`)

    // Criar Map para lookup rápido O(1)
    const existingPostsMap = new Map(
      (existingPosts || []).map((p: any) => [p.instagram_media_id, p.id])
    )

    // Separar posts para inserir vs atualizar
    const postsToInsert: any[] = []
    const postsToUpdate: any[] = []
    const now = new Date().toISOString()

    for (const post of instagramData.data) {
      const postData = {
        like_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
        synced_at: now,
      }

      if (existingPostsMap.has(post.id)) {
        // Post já existe - atualizar
        postsToUpdate.push({
          id: existingPostsMap.get(post.id),
          ...postData,
        })
      } else {
        // Post novo - inserir
        postsToInsert.push({
          instagram_account_id: account.id,
          instagram_media_id: post.id,
          caption: post.caption || '',
          media_type: post.media_type || 'IMAGE',
          media_url: post.media_url || post.thumbnail_url || '',
          thumbnail_url: post.thumbnail_url || post.media_url || '',
          permalink: post.permalink || '',
          timestamp: post.timestamp || now,
          ...postData,
        })
      }
    }

    let newPostsCount = 0
    let updatedPostsCount = 0

    // Bulk insert de novos posts
    if (postsToInsert.length > 0) {
      console.log(`➕ Inserindo ${postsToInsert.length} novos posts...`)
      const { error: insertError } = await (supabase
        .from('instagram_posts') as any)
        .insert(postsToInsert)

      if (!insertError) {
        newPostsCount = postsToInsert.length
      } else {
        console.error('❌ Erro ao inserir posts:', insertError)
      }
    }

    // Atualizar posts existentes (um por um, pois Supabase não suporta bulk update com IDs diferentes)
    if (postsToUpdate.length > 0) {
      console.log(`🔄 Atualizando ${postsToUpdate.length} posts existentes...`)
      for (const postUpdate of postsToUpdate) {
        const { id, ...updateData } = postUpdate
        const { error: updateError } = await (supabase
          .from('instagram_posts') as any)
          .update(updateData)
          .eq('id', id)

        if (!updateError) {
          updatedPostsCount++
        }
      }
    }

    console.log(`✅ Sincronização concluída: ${newPostsCount} novos, ${updatedPostsCount} atualizados`)

    // Atualizar data da última sincronização e contadores
    await (supabase
      .from('instagram_accounts') as any)
      .update({
        last_sync_at: new Date().toISOString(),
        media_count: instagramData.data.length,
      })
      .eq('id', account.id)

    return NextResponse.json({
      success: true,
      newPosts: newPostsCount,
      updatedPosts: updatedPostsCount,
      totalPosts: instagramData.data.length,
      message: `${newPostsCount} novos posts importados, ${updatedPostsCount} posts atualizados`,
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar' },
      { status: 500 }
    )
  }
}
