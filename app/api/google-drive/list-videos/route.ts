import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleDriveService } from '@/lib/services/google-drive-service';

/**
 * Lista vídeos de uma ideia diretamente do Google Drive
 * Sincroniza automaticamente removendo IDs de vídeos deletados
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Pega ideaId da query string
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return NextResponse.json(
        { error: 'ideaId is required' },
        { status: 400 }
      );
    }

    // Verifica se a ideia pertence ao usuário
    const { data: idea, error: ideaError } = await (supabase
      .from('ideas') as any)
      .select('id, user_id, drive_video_ids')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    if ((idea as any).user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Lista vídeos diretamente do Google Drive
    const driveService = new GoogleDriveService(supabase);

    try {
      const videos = await driveService.listIdeaVideos(user.id, ideaId);

      // Sincroniza o array drive_video_ids com os vídeos reais
      // Remove IDs de vídeos que foram deletados no Drive
      const currentVideoIds = (idea as any).drive_video_ids || [];
      const driveVideoIds = videos.map(v => v.id);

      // Filtra apenas os vídeos que ainda existem no Drive
      const syncedVideoIds = currentVideoIds.filter((entry: any) =>
        driveVideoIds.includes(entry.id)
      );

      // Adiciona novos vídeos que não estão no array (caso alguém tenha feito upload direto no Drive)
      for (const video of videos) {
        const exists = syncedVideoIds.some((entry: any) => entry.id === video.id);
        if (!exists) {
          syncedVideoIds.push({
            id: video.id,
            name: video.name,
            uploadedAt: video.createdTime || new Date().toISOString(),
          });
        }
      }

      // Atualiza o banco se houve mudanças
      if (JSON.stringify(currentVideoIds) !== JSON.stringify(syncedVideoIds)) {
        await (supabase
          .from('ideas') as any)
          .update({ drive_video_ids: syncedVideoIds })
          .eq('id', ideaId);

        console.log('🔄 Synced drive_video_ids:', {
          ideaId,
          before: currentVideoIds.length,
          after: syncedVideoIds.length,
          removed: currentVideoIds.length - syncedVideoIds.length,
        });
      }

      return NextResponse.json({
        videos: syncedVideoIds,
        driveVideos: videos, // Dados completos do Drive (com links, thumbnails, etc)
      });
    } catch (driveError: any) {
      // Se não está conectado ao Drive, retorna lista vazia
      if (driveError.message === 'Google Drive not connected') {
        return NextResponse.json({
          videos: [],
          driveVideos: [],
          message: 'Google Drive not connected',
        });
      }
      throw driveError;
    }
  } catch (error: any) {
    console.error('❌ List Videos Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list videos' },
      { status: 500 }
    );
  }
}
