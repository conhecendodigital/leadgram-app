import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleDriveService } from '@/lib/services/google-drive-service';

export async function POST() {
  try {
    // Verificar autenticação
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const driveService = new GoogleDriveService(supabase);
    await driveService.disconnect(user.id);

    console.log('✅ Google Drive disconnected successfully for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Google Drive disconnected successfully',
    });
  } catch (error) {
    console.error('❌ Disconnect Error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Drive' },
      { status: 500 }
    );
  }
}
