import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { SecurityService } from '@/lib/services/security-service';
import speakeasy from 'speakeasy';

/**
 * API para verificar código 2FA e ativar
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const securityService = new SecurityService(supabase);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { secret, token, backupCodes } = await request.json();

    if (!secret || !token || !backupCodes) {
      return NextResponse.json(
        { error: 'Secret, token e backupCodes são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar token TOTP
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Aceita +/- 1 minuto de diferença
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Código inválido. Tente novamente.' },
        { status: 400 }
      );
    }

    // Salvar 2FA no banco
    await securityService.enable2FA(user.id, secret, backupCodes);

    return NextResponse.json({
      success: true,
      message: '2FA ativado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao verificar 2FA:', error);
    return NextResponse.json(
      {
        error: 'Erro ao verificar 2FA',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
