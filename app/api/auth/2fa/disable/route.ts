import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { SecurityService } from '@/lib/services/security-service';
import speakeasy from 'speakeasy';

/**
 * API para desativar 2FA
 * Requer confirmação com código atual ou backup code
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const securityService = new SecurityService(supabase);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token de confirmação é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar configuração 2FA atual
    const twoFAConfig = await securityService.get2FAStatus(user.id);

    if (!twoFAConfig || !twoFAConfig.enabled) {
      return NextResponse.json(
        { error: '2FA não está ativo' },
        { status: 400 }
      );
    }

    // Verificar se é um código TOTP válido
    const isTOTPValid = speakeasy.totp.verify({
      secret: twoFAConfig.secret!,
      encoding: 'base32',
      token,
      window: 2
    });

    // Verificar se é um backup code válido
    const isBackupCode = twoFAConfig.backup_codes?.includes(token);

    if (!isTOTPValid && !isBackupCode) {
      return NextResponse.json(
        { error: 'Código inválido. Use seu código atual do app ou um backup code.' },
        { status: 400 }
      );
    }

    // Desativar 2FA
    await securityService.disable2FA(user.id);

    return NextResponse.json({
      success: true,
      message: '2FA desativado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao desativar 2FA:', error);
    return NextResponse.json(
      {
        error: 'Erro ao desativar 2FA',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
