import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleDriveService } from '@/lib/services/google-drive-service';

export async function GET() {
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
    const connection = await driveService.getConnection(user.id);

    if (!connection) {
      return NextResponse.json({
        connected: false,
        connection: null,
      });
    }

    return NextResponse.json({
      connected: true,
      connection: {
        id: connection.id,
        email: connection.email,
        folder_id: connection.folder_id,
        is_active: connection.is_active,
        created_at: connection.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to get connection status' },
      { status: 500 }
    );
  }
}
