import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * API para iniciar o setup de 2FA
 * Gera secret, QR code e backup codes
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Gerar secret TOTP
    const secret = speakeasy.generateSecret({
      name: `Leadgram (${user.email})`,
      issuer: 'Leadgram'
    });

    // Gerar QR Code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Gerar códigos de backup (10 códigos de 8 caracteres)
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      backupCodes,
      otpauthUrl: secret.otpauth_url
    });

  } catch (error) {
    console.error('Erro ao configurar 2FA:', error);
    return NextResponse.json(
      {
        error: 'Erro ao configurar 2FA',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
