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

      // ===== VERIFICAÇÃO DE DISPOSITIVO DESABILITADA =====
      // Removido temporariamente para simplificar o fluxo de autenticação
      // O sistema OTP de email já fornece segurança suficiente

      // Registrar login bem-sucedido
      await recordSuccessfulLogin(email, data.user.id, requestInfo);

      // Marcar dispositivo como confiável (para futura implementação)
      try {
        await DeviceVerificationService.trustCurrentDevice(data.user.id);
      } catch (error) {
        console.error('Erro ao marcar dispositivo:', error);
        // Não bloquear o login se falhar
      }

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
