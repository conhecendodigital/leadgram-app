import { headers } from 'next/headers';

/**
 * Extrai informações da requisição HTTP
 * Útil para logging, segurança e auditoria
 */
export async function getRequestInfo() {
  const headersList = await headers();

  // IP address (considera proxies e cloudflare)
  const ipAddress =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    '127.0.0.1';

  // User Agent
  const userAgent = headersList.get('user-agent') || 'Unknown';

  // Parsear informações do User Agent
  const deviceInfo = parseUserAgent(userAgent);

  // Localização (do Cloudflare ou headers)
  const locationCountry = headersList.get('cf-ipcountry') || undefined;
  const locationCity = headersList.get('cf-ipcity') || undefined;

  return {
    ipAddress,
    userAgent,
    ...deviceInfo,
    locationCountry,
    locationCity
  };
}

/**
 * Parseia User Agent para extrair informações do dispositivo
 */
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Device Type
  let deviceType = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Browser
  let browser = 'Unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return {
    deviceType,
    browser,
    os
  };
}
