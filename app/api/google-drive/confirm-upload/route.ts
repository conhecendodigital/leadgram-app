import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { ideaId, fileId, fileName } = await request.json();

    if (!ideaId || !fileId || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields: ideaId, fileId, fileName' },
        { status: 400 }
      );
    }

    // Verificar se a ideia pertence ao usuário
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

    if (idea.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Adicionar o vídeo ao array drive_video_ids
    const videoIds = idea.drive_video_ids || [];
    videoIds.push({
      id: fileId,
      name: fileName,
      uploadedAt: new Date().toISOString(),
    });

    await (supabase.from('ideas') as any)
      .update({ drive_video_ids: videoIds })
      .eq('id', ideaId);

    console.log('✅ Upload confirmed:', {
      ideaId,
      fileId,
      fileName,
      totalVideos: videoIds.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Upload confirmed successfully',
      file: {
        id: fileId,
        name: fileName,
      },
    });

  } catch (error: any) {
    console.error('❌ Confirm Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}
