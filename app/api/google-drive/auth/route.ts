import { NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/services/google-drive-service';

export async function GET() {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!clientId) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured' },
        { status: 500 }
      );
    }

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'GOOGLE_CLIENT_SECRET not configured' },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL not configured' },
        { status: 500 }
      );
    }

    const driveService = new GoogleDriveService();
    const authUrl = driveService.getAuthUrl();

    console.log('🔐 Google Drive Auth - Redirect URI:', `${appUrl}/api/google-drive/callback`);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
