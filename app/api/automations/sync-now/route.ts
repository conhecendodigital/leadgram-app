import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Sincronizar agora (manual)
export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Criar registro de sync_history (status: in_progress)
    const { data: syncRecord, error: syncError } = await (supabase
      .from('sync_history') as any)
      .insert({
        user_id: user.id,
        sync_type: 'manual',
        sync_source: 'instagram',
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (syncError) throw syncError

    try {
      // Chamar a API de sync do Instagram
      const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || ''
        }
      })

      const syncResult = await syncResponse.json()

      const duration = Date.now() - startTime

      if (!syncResponse.ok) {
        // Sincronização falhou
        await (supabase
          .from('sync_history') as any)
          .update({
            status: 'error',
            error_message: syncResult.error || 'Unknown error',
            completed_at: new Date().toISOString(),
            duration_ms: duration
          })
          .eq('id', syncRecord.id)

        return NextResponse.json(
          {
            success: false,
            error: syncResult.error || 'Sync failed',
            syncId: syncRecord.id
          },
          { status: syncResponse.status }
        )
      }

      // Sincronização bem-sucedida
      await (supabase
        .from('sync_history') as any)
        .update({
          status: 'success',
          new_posts: syncResult.new_posts || 0,
          updated_posts: syncResult.updated_posts || 0,
          completed_at: new Date().toISOString(),
          duration_ms: duration
        })
        .eq('id', syncRecord.id)

      return NextResponse.json({
        success: true,
        message: 'Sincronização concluída com sucesso',
        syncId: syncRecord.id,
        new_posts: syncResult.new_posts || 0,
        updated_posts: syncResult.updated_posts || 0,
        duration_ms: duration
      })

    } catch (syncException: any) {
      // Erro durante sincronização
      const duration = Date.now() - startTime

      await (supabase
        .from('sync_history') as any)
        .update({
          status: 'error',
          error_message: syncException.message || 'Sync exception',
          completed_at: new Date().toISOString(),
          duration_ms: duration
        })
        .eq('id', syncRecord.id)

      throw syncException
    }

  } catch (error: any) {
    console.error('Error in sync-now:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync'
      },
      { status: 500 }
    )
  }
}
