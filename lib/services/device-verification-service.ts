import { createServerClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

interface DeviceInfo {
  fingerprint: string
  name: string
  type: string
  browser: string
  os: string
  ipAddress: string
}

/**
 * Serviço de Verificação de Dispositivos
 * Detecta novos dispositivos e gerencia dispositivos confiáveis
 */
export class DeviceVerificationService {
  /**
   * Gera fingerprint único do dispositivo baseado em IP + User Agent
   */
  static async getDeviceFingerprint(): Promise<string> {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const ipAddress = await this.getClientIP()

    // Criar hash único
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${ipAddress}-${userAgent}`)
      .digest('hex')

    return fingerprint
  }

  /**
   * Obtém IP do cliente (considera proxies/load balancers)
   */
  static async getClientIP(): Promise<string> {
    const headersList = await headers()

    // Tentar vários headers de IP (proxies, Cloudflare, etc)
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIP = headersList.get('x-real-ip')
    const cfConnectingIP = headersList.get('cf-connecting-ip')

    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwardedFor) {
      // X-Forwarded-For pode ter múltiplos IPs, pega o primeiro
      return forwardedFor.split(',')[0].trim()
    }

    return 'unknown'
  }

  /**
   * Analisa User Agent e extrai informações do dispositivo
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const ipAddress = await this.getClientIP()
    const fingerprint = await this.getDeviceFingerprint()

    // Detectar tipo de dispositivo
    let deviceType = 'desktop'
    if (/mobile/i.test(userAgent)) deviceType = 'mobile'
    else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet'

    // Detectar navegador
    let browser = 'Unknown'
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent))
      browser = 'Chrome'
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent))
      browser = 'Safari'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/edge/i.test(userAgent)) browser = 'Edge'

    // Detectar sistema operacional
    let os = 'Unknown'
    if (/windows/i.test(userAgent)) os = 'Windows'
    else if (/mac/i.test(userAgent)) os = 'macOS'
    else if (/linux/i.test(userAgent)) os = 'Linux'
    else if (/android/i.test(userAgent)) os = 'Android'
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS'

    // Nome amigável do dispositivo
    const name = `${browser} em ${os}`

    return {
      fingerprint,
      name,
      type: deviceType,
      browser,
      os,
      ipAddress,
    }
  }

  /**
   * Verifica se o dispositivo atual é confiável
   */
  static async isDeviceTrusted(userId: string): Promise<boolean> {
    try {
      const supabase = await createServerClient()
      const fingerprint = await this.getDeviceFingerprint()

      const { data, error } = await supabase
        .from('trusted_devices')
        .select('id')
        .eq('user_id', userId)
        .eq('device_fingerprint', fingerprint)
        .maybeSingle()

      if (error) {
        console.error('Erro ao verificar dispositivo:', error)
        return false
      }

      // Se encontrou, atualizar last_used_at
      if (data) {
        await supabase
          .from('trusted_devices')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', data.id)

        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao verificar dispositivo:', error)
      return false
    }
  }

  /**
   * Marca o dispositivo atual como confiável
   */
  static async trustCurrentDevice(userId: string): Promise<void> {
    try {
      const supabase = await createServerClient()
      const deviceInfo = await this.getDeviceInfo()

      await supabase.from('trusted_devices').upsert(
        {
          user_id: userId,
          device_fingerprint: deviceInfo.fingerprint,
          device_name: deviceInfo.name,
          device_type: deviceInfo.type,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip_address: deviceInfo.ipAddress,
          last_used_at: new Date().toISOString(),
          trusted_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,device_fingerprint',
        }
      )

      console.log('✅ Dispositivo marcado como confiável:', deviceInfo.name)
    } catch (error) {
      console.error('Erro ao marcar dispositivo como confiável:', error)
      throw error
    }
  }

  /**
   * Lista todos os dispositivos confiáveis do usuário
   */
  static async listTrustedDevices(userId: string) {
    try {
      const supabase = await createServerClient()

      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId)
        .order('last_used_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error)
      return []
    }
  }

  /**
   * Remove um dispositivo confiável
   */
  static async removeDevice(deviceId: string, userId: string): Promise<void> {
    try {
      const supabase = await createServerClient()

      await supabase
        .from('trusted_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', userId)

      console.log('✅ Dispositivo removido:', deviceId)
    } catch (error) {
      console.error('Erro ao remover dispositivo:', error)
      throw error
    }
  }

  /**
   * Verifica se o dispositivo atual é o mesmo (fingerprint)
   */
  static async isCurrentDevice(deviceId: string): Promise<boolean> {
    try {
      const supabase = await createServerClient()
      const fingerprint = await this.getDeviceFingerprint()

      const { data } = await supabase
        .from('trusted_devices')
        .select('device_fingerprint')
        .eq('id', deviceId)
        .maybeSingle()

      return data?.device_fingerprint === fingerprint
    } catch (error) {
      return false
    }
  }
}
