import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { GoogleDriveService } from '@/lib/services/google-drive-service';

/**
 * Deleta vídeo do Google Drive e do banco de dados
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const { videoId, ideaId } = await request.json();

    if (!videoId || !ideaId) {
      return NextResponse.json(
        { error: 'videoId and ideaId are required' },
        { status: 400 }
      );
    }

    // Verifica se a ideia pertence ao usuário
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, user_id, drive_video_ids')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    if (idea.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Tenta deletar do Google Drive (se ainda existir)
    const driveService = new GoogleDriveService(supabase);
    let deletedFromDrive = false;

    try {
      const connection = await driveService.getConnection(user.id);

      if (connection) {
        // Obtém cliente do Drive
        const oauth2Client = new google.auth.OAuth2(
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`
        );

        oauth2Client.setCredentials({
          access_token: connection.access_token,
          refresh_token: connection.refresh_token,
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Deleta o arquivo do Drive
        await drive.files.delete({
          fileId: videoId,
        });

        deletedFromDrive = true;
        console.log('✅ Video deleted from Google Drive:', videoId);
      }
    } catch (driveError: any) {
      // Se o arquivo já não existe no Drive (404), está ok
      if (driveError.code === 404 || driveError.message?.includes('File not found')) {
        console.log('⚠️ Video already deleted from Drive:', videoId);
        deletedFromDrive = true;
      } else {
        console.error('❌ Error deleting from Drive:', driveError);
        // Continua mesmo se falhar no Drive, para limpar do banco
      }
    }

    // Remove do array drive_video_ids no banco
    const currentVideoIds = idea.drive_video_ids || [];
    const updatedVideoIds = currentVideoIds.filter((entry: any) => entry.id !== videoId);

    const { error: updateError } = await supabase
      .from('ideas')
      .update({ drive_video_ids: updatedVideoIds })
      .eq('id', ideaId);

    if (updateError) {
      console.error('❌ Error updating database:', updateError);
      return NextResponse.json(
        { error: 'Failed to update database' },
        { status: 500 }
      );
    }

    console.log('✅ Video removed from database:', {
      ideaId,
      videoId,
      before: currentVideoIds.length,
      after: updatedVideoIds.length,
    });

    return NextResponse.json({
      success: true,
      deletedFromDrive,
      message: deletedFromDrive
        ? 'Video deleted from Google Drive and Leadgram'
        : 'Video removed from Leadgram (already deleted from Drive)',
    });
  } catch (error: any) {
    console.error('❌ Delete Video Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    );
  }
}
