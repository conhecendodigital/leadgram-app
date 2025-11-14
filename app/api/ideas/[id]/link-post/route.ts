import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { id } = await params
    const { platformId, postUrl } = await req.json()

    // Validações
    if (!platformId || !postUrl) {
      return NextResponse.json(
        { error: 'platformId e postUrl são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar URL
    try {
      new URL(postUrl)
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      )
    }

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se a ideia pertence ao usuário
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('user_id')
      .eq('id', id)
      .single<{ user_id: string }>()

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Ideia não encontrada' },
        { status: 404 }
      )
    }

    if (idea.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Atualizar a plataforma com o link do post
    const supabaseAny = supabase as any
    const { error: updateError } = await supabaseAny
      .from('idea_platforms')
      .update({
        post_url: postUrl,
        is_posted: true,
        posted_at: new Date().toISOString(),
      })
      .eq('id', platformId)

    if (updateError) {
      throw updateError
    }

    // Atualizar o status da ideia para 'posted' se ainda não estiver
    const { error: ideaUpdateError } = await supabaseAny
      .from('ideas')
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'recorded') // Só atualiza se estiver como 'recorded'

    if (ideaUpdateError) {
      console.error('Erro ao atualizar status da ideia:', ideaUpdateError)
      // Não retorna erro porque o link foi salvo com sucesso
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao vincular post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
