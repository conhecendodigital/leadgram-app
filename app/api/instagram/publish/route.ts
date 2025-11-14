import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutos para permitir processamento de vídeo

/**
 * POST /api/instagram/publish
 *
 * Publica conteúdo diretamente no Instagram via Content Publishing API
 *
 * Body:
 * - idea_id: ID da ideia
 * - media_url: URL pública do arquivo no Supabase Storage
 * - media_type: 'image' ou 'video'
 * - publish_type: 'post' ou 'reel'
 * - caption: Legenda do post
 *
 * Fluxo:
 * 1. Cria media container no Instagram
 * 2. Se vídeo/reel, aguarda processamento
 * 3. Publica o container
 * 4. Atualiza idea_platforms com post_id e URL
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Parsear body
    const body = await request.json()
    const { idea_id, media_url, media_type, publish_type, caption } = body

    // Validação
    if (!idea_id || !media_url || !media_type || !caption) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: idea_id, media_url, media_type, caption' },
        { status: 400 }
      )
    }

    if (!['image', 'video'].includes(media_type)) {
      return NextResponse.json(
        { error: 'media_type deve ser "image" ou "video"' },
        { status: 400 }
      )
    }

    if (!['post', 'reel'].includes(publish_type)) {
      return NextResponse.json(
        { error: 'publish_type deve ser "post" ou "reel"' },
        { status: 400 }
      )
    }

    console.log('📤 Iniciando publicação no Instagram:', {
      idea_id,
      media_type,
      publish_type,
      caption_length: caption.length,
    })

    // Buscar conta Instagram do usuário
    const { data: instagramAccount, error: accountError } = await (supabase
      .from('instagram_accounts') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (accountError || !instagramAccount) {
      return NextResponse.json(
        { error: 'Nenhuma conta Instagram conectada. Conecte sua conta primeiro.' },
        { status: 404 }
      )
    }

    const account = instagramAccount as {
      instagram_user_id: string
      access_token: string
      username: string
      [key: string]: any
    }

    console.log('✅ Conta Instagram encontrada:', account.username)

    // PASSO 1: Criar media container
    console.log('🔄 Criando media container...')

    const containerUrl = new URL(
      `https://graph.facebook.com/v18.0/${account.instagram_user_id}/media`
    )

    const containerParams: Record<string, string> = {
      access_token: account.access_token,
      caption: caption,
    }

    // Configurar parâmetros baseado no tipo de mídia
    if (media_type === 'image') {
      containerParams.image_url = media_url
    } else {
      // Vídeo
      containerParams.video_url = media_url

      // Se for Reel, adicionar media_type=REELS
      if (publish_type === 'reel') {
        containerParams.media_type = 'REELS'
      }
    }

    Object.entries(containerParams).forEach(([key, value]) => {
      containerUrl.searchParams.set(key, value)
    })

    const containerResponse = await fetch(containerUrl.toString(), {
      method: 'POST',
    })

    if (!containerResponse.ok) {
      const error = await containerResponse.json()
      console.error('❌ Erro ao criar container:', error)

      return NextResponse.json(
        {
          error: 'Erro ao criar container no Instagram',
          details: error.error?.message || 'Erro desconhecido',
          error_code: error.error?.code,
        },
        { status: containerResponse.status }
      )
    }

    const containerData = await containerResponse.json()
    const containerId = containerData.id

    console.log('✅ Container criado:', containerId)

    // PASSO 2: Se vídeo/reel, aguardar processamento
    if (media_type === 'video') {
      console.log('⏳ Aguardando processamento do vídeo...')

      let isReady = false
      let attempts = 0
      const maxAttempts = 60 // 5 minutos (60 * 5 segundos)

      while (!isReady && attempts < maxAttempts) {
        attempts++

        // Consultar status do container
        const statusUrl = new URL(
          `https://graph.facebook.com/v18.0/${containerId}`
        )
        statusUrl.searchParams.set('fields', 'status_code')
        statusUrl.searchParams.set('access_token', account.access_token)

        const statusResponse = await fetch(statusUrl.toString())

        if (!statusResponse.ok) {
          const error = await statusResponse.json()
          console.error('❌ Erro ao verificar status:', error)
          throw new Error('Erro ao verificar status do vídeo')
        }

        const statusData = await statusResponse.json()
        const statusCode = statusData.status_code

        console.log(`📊 Status do vídeo (tentativa ${attempts}/${maxAttempts}):`, statusCode)

        if (statusCode === 'FINISHED') {
          isReady = true
          console.log('✅ Vídeo processado com sucesso!')
        } else if (statusCode === 'ERROR') {
          throw new Error('Erro ao processar vídeo no Instagram')
        } else if (statusCode === 'IN_PROGRESS') {
          // Aguardar 5 segundos antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 5000))
        } else {
          // Status desconhecido, aguardar também
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }

      if (!isReady) {
        throw new Error('Timeout: vídeo não foi processado a tempo')
      }
    }

    // PASSO 3: Publicar container
    console.log('🚀 Publicando container...')

    const publishUrl = new URL(
      `https://graph.facebook.com/v18.0/${account.instagram_user_id}/media_publish`
    )
    publishUrl.searchParams.set('creation_id', containerId)
    publishUrl.searchParams.set('access_token', account.access_token)

    const publishResponse = await fetch(publishUrl.toString(), {
      method: 'POST',
    })

    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      console.error('❌ Erro ao publicar:', error)

      return NextResponse.json(
        {
          error: 'Erro ao publicar no Instagram',
          details: error.error?.message || 'Erro desconhecido',
          error_code: error.error?.code,
        },
        { status: publishResponse.status }
      )
    }

    const publishData = await publishResponse.json()
    const mediaId = publishData.id

    console.log('✅ Publicado com sucesso! Media ID:', mediaId)

    // PASSO 4: Buscar permalink do post
    const permalinkUrl = new URL(
      `https://graph.facebook.com/v18.0/${mediaId}`
    )
    permalinkUrl.searchParams.set('fields', 'permalink')
    permalinkUrl.searchParams.set('access_token', account.access_token)

    const permalinkResponse = await fetch(permalinkUrl.toString())
    let permalink = null

    if (permalinkResponse.ok) {
      const permalinkData = await permalinkResponse.json()
      permalink = permalinkData.permalink
      console.log('✅ Permalink obtido:', permalink)
    }

    // PASSO 5: Atualizar ou criar idea_platform
    console.log('💾 Atualizando idea_platform...')

    // Verificar se já existe uma plataforma Instagram para esta ideia
    const { data: existingPlatform } = await (supabase
      .from('idea_platforms') as any)
      .select('id')
      .eq('idea_id', idea_id)
      .eq('platform', 'instagram')
      .single()

    if (existingPlatform) {
      // Atualizar existente
      await (supabase
        .from('idea_platforms') as any)
        .update({
          platform_post_id: mediaId,
          post_url: permalink,
          is_posted: true,
          posted_at: new Date().toISOString(),
        })
        .eq('id', existingPlatform.id)
    } else {
      // Criar nova
      await (supabase
        .from('idea_platforms') as any)
        .insert({
          idea_id: idea_id,
          platform: 'instagram',
          platform_post_id: mediaId,
          post_url: permalink,
          is_posted: true,
          posted_at: new Date().toISOString(),
        })
    }

    // PASSO 6: Atualizar status da ideia para "posted" se ainda não estiver
    await (supabase
      .from('ideas') as any)
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
      })
      .eq('id', idea_id)

    console.log('✅ Publicação concluída com sucesso!')

    return NextResponse.json({
      success: true,
      media_id: mediaId,
      permalink: permalink,
      message: 'Publicado no Instagram com sucesso!',
    })

  } catch (error: any) {
    console.error('❌ Erro fatal ao publicar:', error)
    return NextResponse.json(
      {
        error: 'Erro interno ao publicar no Instagram',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
