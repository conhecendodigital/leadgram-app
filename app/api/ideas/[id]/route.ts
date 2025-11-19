import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'
import { google } from 'googleapis'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: idea, error } = await supabase
      .from('ideas')
      .select(`
        *,
        platforms:idea_platforms(
          id,
          platform,
          platform_post_id,
          post_url,
          posted_at,
          is_posted,
          metrics(*)
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, theme, script, editor_instructions, status, funnel_stage, platforms } = body

    // Atualizar ideia
    const updateData: Database['public']['Tables']['ideas']['Update'] = {
      title,
      theme: theme || null,
      script: script || null,
      editor_instructions: editor_instructions || null,
      status,
      funnel_stage,
      updated_at: new Date().toISOString(),
    }

    const { data: idea, error: ideaError } = await (supabase
      .from('ideas') as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (ideaError) throw ideaError

    // Atualizar plataformas (deletar antigas e criar novas)
    if (platforms) {
      // Deletar plataformas antigas
      await supabase
        .from('idea_platforms')
        .delete()
        .eq('idea_id', id)

      // Criar novas plataformas
      if (platforms.length > 0) {
        const platformsData = platforms.map((platform: string) => ({
          idea_id: idea.id,
          platform,
          is_posted: false,
        }))

        await supabase.from('idea_platforms').insert(platformsData)
      }
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Buscar a ideia primeiro para pegar drive_folder_id
    const { data: idea } = await (supabase
      .from('ideas') as any)
      .select('drive_folder_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Se tiver pasta no Google Drive, deletar
    if (idea?.drive_folder_id) {
      try {
        // Buscar conexão do Google Drive
        const { data: connection } = await (supabase
          .from('google_drive_accounts') as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (connection) {
          const oauth2Client = new google.auth.OAuth2(
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`
          )

          oauth2Client.setCredentials({
            access_token: connection.access_token,
            refresh_token: connection.refresh_token,
          })

          const drive = google.drive({ version: 'v3', auth: oauth2Client })

          // Deletar pasta do Drive (move para lixeira)
          await drive.files.delete({
            fileId: idea.drive_folder_id,
          })

          console.log('✅ Pasta do Drive deletada:', idea.drive_folder_id)
        }
      } catch (driveError) {
        // Log mas não falha - ideia ainda será deletada do banco
        console.error('⚠️ Erro ao deletar pasta do Drive:', driveError)
      }
    }

    // Deletar ideia do banco (cascade vai deletar platforms e metrics)
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}
