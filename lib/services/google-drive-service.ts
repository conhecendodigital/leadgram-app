import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

export interface GoogleDriveAccount {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  folder_id: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
}

export class GoogleDriveService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    // @ts-ignore - supabaseClient pode ser passado ou será criado de forma assíncrona
    this.supabase = supabaseClient;
  }

  /**
   * Cria cliente OAuth2 do Google
   */
  private getOAuth2Client() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Gera URL de autorização OAuth
   */
  getAuthUrl(): string {
    const oauth2Client = this.getOAuth2Client();

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  /**
   * Troca code por tokens OAuth
   */
  async exchangeCodeForTokens(code: string) {
    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    return tokens;
  }

  /**
   * Obtém informações do usuário Google
   */
  async getUserInfo(accessToken: string) {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    return data;
  }

  /**
   * Salva ou atualiza conexão do Google Drive no banco
   */
  async saveConnection(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    email: string
  ): Promise<GoogleDriveAccount> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { data, error } = await this.supabase
      .from('google_drive_accounts')
      .upsert(
        {
          user_id: userId,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt,
          email,
          is_active: true,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return data as GoogleDriveAccount;
  }

  /**
   * Obtém conexão do Google Drive do usuário
   */
  async getConnection(userId: string): Promise<GoogleDriveAccount | null> {
    const { data, error } = await this.supabase
      .from('google_drive_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    return data as GoogleDriveAccount | null;
  }

  /**
   * Obtém cliente do Drive autenticado
   */
  private async getDriveClient(userId: string) {
    const connection = await this.getConnection(userId);

    if (!connection) {
      throw new Error('Google Drive not connected');
    }

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
    });

    // Auto-refresh token se expirado
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await this.supabase
          .from('google_drive_accounts')
          .update({
            access_token: tokens.access_token,
            token_expires_at: tokens.expiry_date
              ? new Date(tokens.expiry_date).toISOString()
              : null,
          })
          .eq('user_id', userId);
      }
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Verifica se a pasta "Ideias" existe no Drive e não está na lixeira
   * Se não existir ou estiver na lixeira, recria automaticamente
   */
  async verifyAndRecreateIdeasFolder(userId: string, currentFolderId: string | null): Promise<string> {
    const drive = await this.getDriveClient(userId);

    // Se não tem folder_id, cria nova pasta
    if (!currentFolderId) {
      console.log('⚠️ No folder_id found, creating new Ideas folder');
      return await this.createIdeasFolder(userId);
    }

    // Verifica se a pasta ainda existe no Drive e não está na lixeira
    try {
      const { data } = await drive.files.get({
        fileId: currentFolderId,
        fields: 'id, name, trashed',
      });

      // Se pasta está na lixeira, recria
      if (data.trashed === true) {
        console.log('⚠️ Ideas folder is in trash, recreating...');
        return await this.createIdeasFolder(userId);
      }

      // Pasta existe e não está na lixeira
      console.log('✅ Ideas folder exists:', currentFolderId);
      return currentFolderId;
    } catch (error: any) {
      // Pasta foi deletada permanentemente (erro 404 ou 403)
      if (error.code === 404 || error.message?.includes('File not found')) {
        console.log('⚠️ Ideas folder was deleted, recreating...');
        return await this.createIdeasFolder(userId);
      }

      // Outro erro (permissão, etc)
      throw error;
    }
  }

  /**
   * Cria pasta "Ideias" na raiz do Drive
   */
  async createIdeasFolder(userId: string): Promise<string> {
    const drive = await this.getDriveClient(userId);

    const fileMetadata = {
      name: 'Ideias',
      mimeType: 'application/vnd.google-apps.folder',
    };

    const { data } = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    const folderId = data.id!;

    // Salva folder_id no banco
    await this.supabase
      .from('google_drive_accounts')
      .update({ folder_id: folderId })
      .eq('user_id', userId);

    console.log('✅ Created new Ideas folder:', folderId);
    return folderId;
  }

  /**
   * Cria subpasta para uma ideia específica
   * Verifica se a pasta "Ideias" existe, recria se necessário
   */
  async createIdeaFolder(
    userId: string,
    ideaId: string,
    ideaTitle: string
  ): Promise<string> {
    const drive = await this.getDriveClient(userId);
    const connection = await this.getConnection(userId);

    // Verifica se a pasta "Ideias" existe (e recria se deletada)
    const ideasFolderId = await this.verifyAndRecreateIdeasFolder(
      userId,
      connection?.folder_id || null
    );

    const fileMetadata = {
      name: ideaTitle,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ideasFolderId],
    };

    const { data } = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    const folderId = data.id!;

    // Salva folder_id na ideia
    await this.supabase
      .from('ideas')
      .update({ drive_folder_id: folderId })
      .eq('id', ideaId);

    console.log('✅ Created idea folder:', { ideaId, folderId, ideaTitle });
    return folderId;
  }

  /**
   * Upload de vídeo para pasta da ideia
   * IMPORTANTE: Mantém a qualidade original do vídeo
   * Verifica se a pasta existe, recria se necessário
   */
  async uploadVideo(
    userId: string,
    ideaId: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<DriveFile> {
    const drive = await this.getDriveClient(userId);

    // Busca a ideia para pegar o folder_id
    const { data: idea } = await this.supabase
      .from('ideas')
      .select('drive_folder_id, title')
      .eq('id', ideaId)
      .single();

    if (!idea) {
      throw new Error('Idea not found');
    }

    // Se não tem folder, cria
    let folderId = idea.drive_folder_id;
    if (!folderId) {
      folderId = await this.createIdeaFolder(userId, ideaId, idea.title);
    } else {
      // Verifica se a pasta da ideia ainda existe no Drive e não está na lixeira
      try {
        const { data } = await drive.files.get({
          fileId: folderId,
          fields: 'id, name, trashed',
        });

        // Se pasta está na lixeira, recria
        if (data.trashed === true) {
          console.log('⚠️ Idea folder is in trash, recreating...');
          folderId = await this.createIdeaFolder(userId, ideaId, idea.title);
        } else {
          console.log('✅ Idea folder exists:', folderId);
        }
      } catch (error: any) {
        // Pasta foi deletada permanentemente, recria
        if (error.code === 404 || error.message?.includes('File not found')) {
          console.log('⚠️ Idea folder was deleted permanently, recreating...');
          folderId = await this.createIdeaFolder(userId, ideaId, idea.title);
        } else {
          throw error;
        }
      }
    }

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // Converte Buffer em Stream para a API do Google Drive
    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    const { data } = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, size, webViewLink, thumbnailLink, createdTime',
    });

    // Adiciona o ID do vídeo no array drive_video_ids da ideia
    const { data: currentIdea } = await this.supabase
      .from('ideas')
      .select('drive_video_ids')
      .eq('id', ideaId)
      .single();

    const videoIds = currentIdea?.drive_video_ids || [];
    videoIds.push({
      id: data.id,
      name: data.name,
      uploadedAt: new Date().toISOString(),
    });

    await this.supabase
      .from('ideas')
      .update({ drive_video_ids: videoIds })
      .eq('id', ideaId);

    return data as DriveFile;
  }

  /**
   * Lista vídeos de uma ideia
   */
  async listIdeaVideos(userId: string, ideaId: string): Promise<DriveFile[]> {
    const drive = await this.getDriveClient(userId);

    const { data: idea } = await this.supabase
      .from('ideas')
      .select('drive_folder_id')
      .eq('id', ideaId)
      .single();

    if (!idea?.drive_folder_id) {
      return [];
    }

    const { data } = await drive.files.list({
      q: `'${idea.drive_folder_id}' in parents and mimeType contains 'video/' and trashed=false`,
      fields: 'files(id, name, mimeType, size, webViewLink, thumbnailLink, createdTime)',
      orderBy: 'createdTime desc',
    });

    return (data.files || []) as DriveFile[];
  }

  /**
   * Desconecta conta Google Drive
   */
  async disconnect(userId: string): Promise<void> {
    await this.supabase
      .from('google_drive_accounts')
      .update({ is_active: false })
      .eq('user_id', userId);
  }
}
