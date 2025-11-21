import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

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

    const { fileName, fileSize, mimeType, ideaId } = await request.json();

    if (!fileName || !fileSize || !mimeType || !ideaId) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileSize, mimeType, ideaId' },
        { status: 400 }
      );
    }

    // BUG #19 FIX: Validar tamanho máximo do arquivo (2GB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `O arquivo é muito grande. Tamanho máximo: 2GB. Seu arquivo: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)}GB`,
          maxSize: MAX_FILE_SIZE,
          currentSize: fileSize
        },
        { status: 413 }
      );
    }

    // Verificar se a ideia pertence ao usuário
    const { data: idea, error: ideaError } = await (supabase
      .from('ideas') as any)
      .select('id, title, user_id, drive_folder_id')
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

    // Obter conexão do Google Drive
    const { data: connection, error: connError } = await (supabase
      .from('google_drive_accounts') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (connError || !connection) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      );
    }

    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`
    );

    oauth2Client.setCredentials({
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
    });

    // Auto-refresh token se necessário
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await (supabase
          .from('google_drive_accounts') as any)
          .update({
            access_token: tokens.access_token,
            token_expires_at: tokens.expiry_date
              ? new Date(tokens.expiry_date).toISOString()
              : null,
          })
          .eq('user_id', user.id);
      }
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Garantir que a pasta da ideia existe
    let folderId = idea.drive_folder_id;

    if (!folderId) {
      // Verificar/criar pasta "Ideias" principal
      let ideasFolderId = connection.folder_id;

      if (!ideasFolderId) {
        // Criar pasta "Ideias"
        const { data: folderData } = await drive.files.create({
          requestBody: {
            name: 'Ideias',
            mimeType: 'application/vnd.google-apps.folder',
          },
          fields: 'id',
        });

        ideasFolderId = folderData.id!;

        await (supabase
          .from('google_drive_accounts') as any)
          .update({ folder_id: ideasFolderId })
          .eq('user_id', user.id);
      }

      // Criar subpasta da ideia
      const { data: ideaFolderData } = await drive.files.create({
        requestBody: {
          name: idea.title,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [ideasFolderId],
        },
        fields: 'id',
      });

      folderId = ideaFolderData.id!;

      await (supabase.from('ideas') as any)
        .update({ drive_folder_id: folderId })
        .eq('id', ideaId);
    }

    // Criar sessão de upload resumable
    // Usar a API REST diretamente para obter a URL de upload
    const accessToken = (await oauth2Client.getAccessToken()).token;

    const initResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': fileSize.toString(),
        },
        body: JSON.stringify({
          name: fileName,
          parents: [folderId],
        }),
      }
    );

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error('Failed to init resumable upload:', errorText);
      return NextResponse.json(
        { error: 'Failed to initialize upload session' },
        { status: 500 }
      );
    }

    const uploadUrl = initResponse.headers.get('Location');

    if (!uploadUrl) {
      return NextResponse.json(
        { error: 'Failed to get upload URL' },
        { status: 500 }
      );
    }

    console.log('✅ Resumable upload session created:', {
      fileName,
      fileSize,
      ideaId,
      folderId,
    });

    return NextResponse.json({
      uploadUrl,
      folderId,
      message: 'Upload session created successfully',
    });

  } catch (error: any) {
    console.error('❌ Init Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize upload' },
      { status: 500 }
    );
  }
}
