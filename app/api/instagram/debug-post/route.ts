import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/instagram/debug-post?shortcode=XXXXX
 *
 * Busca informações de um post específico pelo shortcode
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortcode = searchParams.get('shortcode')

    if (!shortcode) {
      return NextResponse.json({ error: 'Parâmetro shortcode é obrigatório' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar conta Instagram conectada
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Nenhuma conta Instagram conectada' }, { status: 404 })
    }

    const validAccount = account as {
      username: string
      instagram_user_id: string
      access_token: string
      [key: string]: any
    }

    console.log(`🔍 DEBUG: Buscando post com shortcode: ${shortcode}`)

    // Tentar buscar por shortcode usando a API do Facebook
    // A API não suporta busca direta por shortcode, então vamos buscar todos os posts
    // e procurar pelo permalink que contém o shortcode

    let allPosts: any[] = []
    let nextPageUrl: string | null = null

    // Primeira requisição
    const initialUrl = `https://graph.facebook.com/v18.0/${validAccount.instagram_user_id}/media?fields=id,shortcode,media_type,timestamp,permalink,caption&limit=100&access_token=${validAccount.access_token}`

    let response = await fetch(initialUrl)
    let data = await response.json()

    if (data.data) {
      allPosts = [...data.data]
      nextPageUrl = data.paging?.next || null
    }

    // Continuar paginação até encontrar o post ou acabar
    let pageCount = 1
    let foundPost = allPosts.find((p: any) =>
      p.permalink?.includes(shortcode) || p.shortcode === shortcode
    )

    while (nextPageUrl && !foundPost && pageCount < 20) {
      response = await fetch(nextPageUrl)
      data = await response.json()

      if (data.data && data.data.length > 0) {
        allPosts = [...allPosts, ...data.data]
        foundPost = data.data.find((p: any) =>
          p.permalink?.includes(shortcode) || p.shortcode === shortcode
        )
        pageCount++
      }

      nextPageUrl = data.paging?.next || null
    }

    // Verificar se encontrou
    if (foundPost) {
      return NextResponse.json({
        found: true,
        message: '✅ Post encontrado na API do Facebook!',
        post: foundPost,
        total_posts_searched: allPosts.length,
      })
    }

    // Não encontrou - vamos verificar se o shortcode está em algum permalink
    const allPermalinks = allPosts.map((p: any) => p.permalink)
    const matchingPermalinks = allPermalinks.filter((url: string) =>
      url && url.toLowerCase().includes(shortcode.toLowerCase().substring(0, 10))
    )

    // Verificar a data do post mais antigo retornado
    const sortedByDate = [...allPosts].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const oldestPost = sortedByDate[0]
    const newestPost = sortedByDate[sortedByDate.length - 1]

    return NextResponse.json({
      found: false,
      message: '❌ Post NÃO encontrado na API do Facebook',
      shortcode_searched: shortcode,
      total_posts_searched: allPosts.length,
      pages_searched: pageCount,
      partial_matches: matchingPermalinks.slice(0, 5),
      date_range: {
        oldest_post: oldestPost ? { date: oldestPost.timestamp, permalink: oldestPost.permalink } : null,
        newest_post: newestPost ? { date: newestPost.timestamp, permalink: newestPost.permalink } : null,
      },
      possible_reasons: [
        'O post pode estar arquivado',
        'O post pode ter sido publicado como "Colaboração" (collab post)',
        'O post pode ser um Reel que não está sendo retornado corretamente',
        'O shortcode pode estar truncado ou incorreto',
        'A conta conectada pode não ter permissão para acessar este post',
        'O post pode ter sido criado com uma conta diferente',
      ],
      tip: 'Verifique se o post foi publicado como "Colaboração" com outra conta, pois esses posts aparecem no feed mas pertencem à outra conta.',
    })

  } catch (error: any) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json(
      { error: 'Erro ao debugar', message: error.message },
      { status: 500 }
    )
  }
}
