import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  securityMiddleware,
  recordSuccessfulLogin,
  recordFailedLogin
} from '@/lib/middleware/security-middleware';
import { getRequestInfo } from '@/lib/utils/request-info';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { DeviceVerificationService } from '@/lib/services/device-verification-service';

/**
 * API de Login com Sistema de Segurança Integrado
 * - Rate limiting: 5 tentativas por minuto
 * - Verifica IP bloqueado
 * - Registra tentativas de login
 * - Bloqueia IPs após tentativas falhas
 * - Registra sessões ativas
 * - Cria logs de auditoria
 */
export async function POST(request: Request) {
  try {
    // ===== RATE LIMITING: 5 tentativas por minuto =====
    const rateLimitCheck = await rateLimit({
      max: 5,
      windowSeconds: 60,
      message: 'Muitas tentativas de login. Aguarde um minuto.'
    });

    if (rateLimitCheck.limited) {
      return rateLimitCheck.response!;
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // ===== SEGURANÇA: Verificar IP bloqueado =====
    const securityCheck = await securityMiddleware(email);

    if (securityCheck.blocked) {
      return securityCheck.response!;
    }

    // ===== AUTENTICAÇÃO SUPABASE =====
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // ===== LOGIN FALHOU =====
    if (error) {
      const requestInfo = await getRequestInfo();
      const result = await recordFailedLogin(
        email,
        error.message,
        requestInfo
      );

      if (result.blocked) {
        return NextResponse.json(
          {
            error: 'IP bloqueado',
            message: result.message
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: error.message,
          remainingAttempts: result.remainingAttempts
        },
        { status: 401 }
      );
    }

    // ===== LOGIN BEM-SUCEDIDO =====
    if (data.user) {
      const requestInfo = await getRequestInfo();

      // ===== VERIFICAÇÃO DE DISPOSITIVO =====
      const isDeviceTrusted = await DeviceVerificationService.isDeviceTrusted(data.user.id);

      if (!isDeviceTrusted) {
        // Dispositivo não confiável - enviar magic link para verificação
        console.log('🔒 Novo dispositivo detectado para:', email);

        // Fazer logout da sessão criada automaticamente
        await supabase.auth.signOut();

        // Enviar magic link para verificação do dispositivo
        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-device`,
          }
        });

        if (magicLinkError) {
          console.error('Erro ao enviar magic link:', magicLinkError);
          return NextResponse.json(
            { error: 'Erro ao enviar email de verificação' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: false,
          requiresDeviceVerification: true,
          email: email,
          message: 'Novo dispositivo detectado. Enviamos um link de verificação para seu email.'
        });
      }

      // Dispositivo confiável - permitir login
      await recordSuccessfulLogin(email, data.user.id, requestInfo);

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email
        },
        session: data.session
      });
    }

    return NextResponse.json(
      { error: 'Falha na autenticação' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
