import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { SecurityService } from '@/lib/services/security-service';
import { getRequestInfo } from '@/lib/utils/request-info';

/**
 * Middleware de segurança para proteger rotas de autenticação
 * Verifica se IP está bloqueado e registra tentativas de login
 */
export async function securityMiddleware(email: string) {
  const supabase = await createServerClient();
  const securityService = new SecurityService(supabase);
  const requestInfo = await getRequestInfo();

  // Verificar se IP está bloqueado
  const isBlocked = await securityService.isIPBlocked(requestInfo.ipAddress);

  if (isBlocked) {
    // Registrar tentativa bloqueada
    await securityService.recordLoginAttempt(
      email,
      requestInfo.ipAddress,
      false,
      requestInfo.userAgent,
      'IP bloqueado'
    );

    return {
      blocked: true,
      error: 'Seu IP foi temporariamente bloqueado devido a múltiplas tentativas de login. Tente novamente mais tarde.',
      response: NextResponse.json(
        {
          error: 'IP bloqueado',
          message: 'Muitas tentativas de login falhadas. Tente novamente mais tarde.'
        },
        { status: 429 }
      )
    };
  }

  return {
    blocked: false,
    securityService,
    requestInfo
  };
}

/**
 * Registra tentativa de login bem-sucedida
 */
export async function recordSuccessfulLogin(
  email: string,
  userId: string,
  requestInfo: ReturnType<typeof getRequestInfo> extends Promise<infer T> ? T : never
) {
  const supabase = await createServerClient();
  const securityService = new SecurityService(supabase);

  // Registrar tentativa bem-sucedida
  await securityService.recordLoginAttempt(
    email,
    requestInfo.ipAddress,
    true,
    requestInfo.userAgent
  );

  // Criar sessão ativa
  await securityService.createSession(
    userId,
    `session_${Date.now()}_${Math.random().toString(36)}`,
    requestInfo.ipAddress,
    requestInfo.userAgent,
    requestInfo.deviceType,
    requestInfo.browser,
    requestInfo.os,
    requestInfo.locationCountry,
    requestInfo.locationCity
  );

  // Log de auditoria
  await securityService.logAction(
    'login',
    'auth',
    userId,
    `Login bem-sucedido de ${requestInfo.ipAddress}`
  );
}

/**
 * Registra tentativa de login falhada e verifica bloqueio
 */
export async function recordFailedLogin(
  email: string,
  reason: string,
  requestInfo: ReturnType<typeof getRequestInfo> extends Promise<infer T> ? T : never
) {
  const supabase = await createServerClient();
  const securityService = new SecurityService(supabase);

  // Registrar tentativa falhada
  await securityService.recordLoginAttempt(
    email,
    requestInfo.ipAddress,
    false,
    requestInfo.userAgent,
    reason
  );

  // Verificar se deve bloquear IP
  const settings = await securityService.getSettings();
  const recentFailures = await securityService.getFailedAttemptsByIP(
    requestInfo.ipAddress,
    15 // últimos 15 minutos
  );

  if (recentFailures >= settings.max_login_attempts) {
    // Bloquear IP temporariamente
    const blockedUntil = new Date();
    blockedUntil.setMinutes(blockedUntil.getMinutes() + settings.lockout_duration);

    await securityService.blockIP(
      requestInfo.ipAddress,
      `Bloqueio automático: ${recentFailures} tentativas falhas`,
      recentFailures,
      blockedUntil
    );

    // Log de auditoria
    await securityService.logAction(
      'block_ip',
      'security',
      undefined,
      `IP ${requestInfo.ipAddress} bloqueado automaticamente por ${recentFailures} tentativas falhas`
    );

    return {
      blocked: true,
      message: `IP bloqueado por ${settings.lockout_duration} minutos devido a múltiplas tentativas falhas.`
    };
  }

  return {
    blocked: false,
    remainingAttempts: settings.max_login_attempts - recentFailures
  };
}
