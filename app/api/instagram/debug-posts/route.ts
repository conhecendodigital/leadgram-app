import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/instagram/debug-posts
 *
 * API de debug para investigar por que alguns posts não aparecem
 */
export async function GET(request: NextRequest) {
  try {
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
      media_count: number
      [key: string]: any
    }

    console.log('🔍 DEBUG: Iniciando investigação de posts...')
    console.log(`📊 media_count na conta: ${validAccount.media_count}`)

    // PASSO 1: Buscar contagem oficial da API do Facebook
    const profileUrl = `https://graph.facebook.com/v18.0/${validAccount.instagram_user_id}?fields=media_count,username&access_token=${validAccount.access_token}`
    const profileResponse = await fetch(profileUrl)
    const profileData = await profileResponse.json()

    console.log(`📊 media_count da API do Facebook: ${profileData.media_count}`)

    // PASSO 2: Buscar TODOS os posts com paginação completa
    let allPosts: any[] = []
    let nextPageUrl: string | null = null
    let pageCount = 0

    // Primeira requisição
    const initialUrl = `https://graph.facebook.com/v18.0/${validAccount.instagram_user_id}/media?fields=id,media_type,timestamp,permalink&limit=100&access_token=${validAccount.access_token}`

    let response = await fetch(initialUrl)
    let data = await response.json()

    if (data.data) {
      allPosts = [...data.data]
      nextPageUrl = data.paging?.next || null
      pageCount = 1
      console.log(`📄 Página 1: ${data.data.length} posts (total: ${allPosts.length})`)
    }

    // Continuar paginação
    while (nextPageUrl) {
      response = await fetch(nextPageUrl)
      data = await response.json()

      if (data.data && data.data.length > 0) {
        allPosts = [...allPosts, ...data.data]
        pageCount++
        console.log(`📄 Página ${pageCount}: ${data.data.length} posts (total: ${allPosts.length})`)
      }

      nextPageUrl = data.paging?.next || null

      // Segurança para não entrar em loop infinito
      if (pageCount > 100) {
        console.log('⚠️ Limite de páginas atingido (100)')
        break
      }
    }

    console.log(`✅ Total de posts retornados pela API: ${allPosts.length}`)

    // PASSO 3: Analisar por tipo de mídia
    const byMediaType: Record<string, number> = {}
    allPosts.forEach((post: any) => {
      const type = post.media_type || 'UNKNOWN'
      byMediaType[type] = (byMediaType[type] || 0) + 1
    })

    // PASSO 4: Verificar se há IDs duplicados
    const uniqueIds = new Set(allPosts.map((p: any) => p.id))
    const hasDuplicates = uniqueIds.size !== allPosts.length

    // PASSO 5: Pegar os IDs dos posts mais recentes e mais antigos
    const sortedByDate = [...allPosts].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    const newestPosts = sortedByDate.slice(0, 5).map((p: any) => ({
      id: p.id,
      date: p.timestamp,
      type: p.media_type
    }))

    const oldestPosts = sortedByDate.slice(-5).map((p: any) => ({
      id: p.id,
      date: p.timestamp,
      type: p.media_type
    }))

    // PASSO 6: Calcular diferença
    const difference = validAccount.media_count - allPosts.length
    const apiDifference = profileData.media_count - allPosts.length

    return NextResponse.json({
      debug: true,
      investigation: {
        media_count_stored: validAccount.media_count,
        media_count_from_api: profileData.media_count,
        posts_returned_by_pagination: allPosts.length,
        unique_post_ids: uniqueIds.size,
        has_duplicates: hasDuplicates,
        pages_fetched: pageCount,
        difference_from_stored: difference,
        difference_from_api: apiDifference,
      },
      by_media_type: byMediaType,
      sample_posts: {
        newest_5: newestPosts,
        oldest_5: oldestPosts,
      },
      conclusion: difference === 0
        ? '✅ Todos os posts foram retornados'
        : `⚠️ ${difference} posts não foram retornados pela API do Facebook`,
      possible_causes: difference > 0 ? [
        'Posts arquivados não são retornados pela API',
        'Posts com restrições de visibilidade',
        'Posts deletados mas contagem não atualizada',
        'Stories destacados podem estar contando no media_count',
        'Reels em rascunho ou privados',
      ] : [],
    })

  } catch (error: any) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json(
      { error: 'Erro ao debugar', message: error.message },
      { status: 500 }
    )
  }
}
