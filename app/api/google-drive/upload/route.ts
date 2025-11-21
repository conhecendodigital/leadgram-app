import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleDriveService } from '@/lib/services/google-drive-service';
import { withRateLimit, getRequestIdentifier } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  // Verificar autenticação primeiro
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Rate limiting: 10 req/min por usuário
  const identifier = getRequestIdentifier(request, user.id);

  return withRateLimit(request, identifier, 10, 60, async () => {
    try {

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ideaId = formData.get('ideaId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!ideaId) {
      return NextResponse.json(
        { error: 'No ideaId provided' },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máximo 500MB)
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB em bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `O arquivo é muito grande. Tamanho máximo: 500MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          maxSize: MAX_FILE_SIZE,
          currentSize: file.size
        },
        { status: 413 } // 413 Payload Too Large
      );
    }

    // Validar tipo de arquivo (apenas vídeos)
    const ALLOWED_MIME_TYPES = [
      'video/mp4',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/x-matroska', // .mkv
      'video/webm',
    ];

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: 'Apenas arquivos de vídeo são permitidos (MP4, MOV, AVI, MKV, WEBM)',
          allowedTypes: ALLOWED_MIME_TYPES,
          receivedType: file.type
        },
        { status: 400 }
      );
    }

    // Verificar se a ideia pertence ao usuário
    const { data: idea, error: ideaError } = await (supabase
      .from('ideas') as any)
      .select('id, title, user_id')
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

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📤 Uploading video to Google Drive:', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      ideaId,
      ideaTitle: idea.title,
    });

    // Upload para o Drive
    const driveService = new GoogleDriveService(supabase);
    const uploadedFile = await driveService.uploadVideo(
      user.id,
      ideaId,
      file.name,
      buffer,
      file.type
    );

    console.log('✅ Video uploaded successfully:', uploadedFile);

    return NextResponse.json({
      success: true,
      file: uploadedFile,
      message: 'Video uploaded successfully to Google Drive',
    });
    } catch (error: any) {
      console.error('❌ Upload Error:', error);

      if (error.message === 'Google Drive not connected') {
        return NextResponse.json(
          { error: 'Google Drive not connected. Please connect your account first.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Failed to upload video' },
        { status: 500 }
      );
    }
  })
}
