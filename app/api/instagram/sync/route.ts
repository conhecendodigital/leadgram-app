import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar conta do Instagram conectada
    const { data: account, error: accountError } = await (supabase
      .from('instagram_accounts') as any)
      .select('*')
      .eq('user_id', session.user.id)
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
    const instagramResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${account.access_token}&limit=50`
    )

    if (!instagramResponse.ok) {
      const errorData = await instagramResponse.json()
      console.error('Instagram API error:', errorData)

      return NextResponse.json(
        { error: 'Erro ao buscar posts do Instagram. Verifique a conexão.' },
        { status: 500 }
      )
    }

    const instagramData = await instagramResponse.json()

    if (!instagramData.data || !Array.isArray(instagramData.data)) {
      return NextResponse.json(
        { error: 'Nenhum post encontrado' },
        { status: 404 }
      )
    }

    // Processar e salvar posts
    let newPostsCount = 0
    let updatedPostsCount = 0

    for (const post of instagramData.data) {
      // Verificar se já existe
      const { data: existingPost } = await (supabase
        .from('instagram_posts') as any)
        .select('id')
        .eq('instagram_media_id', post.id)
        .eq('instagram_account_id', account.id)
        .single()

      if (existingPost) {
        // Atualizar post existente
        await (supabase
          .from('instagram_posts') as any)
          .update({
            like_count: post.like_count || 0,
            comments_count: post.comments_count || 0,
            synced_at: new Date().toISOString(),
          })
          .eq('id', existingPost.id)

        updatedPostsCount++
      } else {
        // Inserir novo post
        const { error: insertError } = await (supabase
          .from('instagram_posts') as any)
          .insert({
            instagram_account_id: account.id,
            instagram_media_id: post.id,
            caption: post.caption || '',
            media_type: post.media_type || 'IMAGE',
            media_url: post.media_url || post.thumbnail_url || '',
            thumbnail_url: post.thumbnail_url || post.media_url || '',
            permalink: post.permalink || '',
            timestamp: post.timestamp || new Date().toISOString(),
            like_count: post.like_count || 0,
            comments_count: post.comments_count || 0,
            synced_at: new Date().toISOString(),
          })

        if (!insertError) {
          newPostsCount++
        }
      }
    }

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
