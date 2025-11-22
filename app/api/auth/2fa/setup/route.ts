import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

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

    // Gerar códigos de backup seguros (10 códigos de 8 caracteres)
    // SEGURANÇA: Usa crypto.randomBytes ao invés de Math.random()
    const backupCodes = Array.from({ length: 10 }, () => {
      const bytes = crypto.randomBytes(6)
      return bytes.toString('base64').replace(/[^A-Z0-9]/g, '').substring(0, 8)
    });

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
