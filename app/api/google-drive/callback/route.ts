import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleDriveService } from '@/lib/services/google-drive-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Usuário negou permissão
    if (error) {
      console.error('❌ Google Drive Auth Error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ideas?error=access_denied`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ideas?error=missing_code`
      );
    }

    // Verificar se usuário está autenticado
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ User not authenticated:', authError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=not_authenticated`
      );
    }

    const driveService = new GoogleDriveService(supabase);

    // Trocar code por tokens
    console.log('🔄 Exchanging code for tokens...');
    const tokens = await driveService.exchangeCodeForTokens(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get access tokens');
    }

    // Buscar informações do usuário Google
    console.log('👤 Fetching user info...');
    const userInfo = await driveService.getUserInfo(tokens.access_token);

    // Salvar conexão no banco
    console.log('💾 Saving connection to database...');
    const connection = await driveService.saveConnection(
      user.id,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
      userInfo.email || ''
    );

    // Criar pasta "Ideias" automaticamente
    console.log('📁 Creating "Ideias" folder...');
    try {
      await driveService.createIdeasFolder(user.id);
      console.log('✅ "Ideias" folder created successfully');
    } catch (folderError) {
      console.error('⚠️ Error creating "Ideias" folder:', folderError);
      // Não falha o processo todo se a pasta não for criada
    }

    console.log('✅ Google Drive connected successfully:', {
      userId: user.id,
      email: userInfo.email,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ideas?google_drive=connected`
    );
  } catch (error) {
    console.error('❌ Google Drive Callback Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ideas?error=connection_failed`
    );
  }
}
