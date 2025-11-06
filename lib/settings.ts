import { createServerClient } from '@/lib/supabase/server'

export interface AppSettings {
  // General
  app_name: string
  app_url: string
  maintenance_mode: boolean
  maintenance_message: string

  // Limits
  free_max_ideas: number
  pro_max_ideas: number
  premium_max_ideas: number
  free_max_posts_per_month: number
  pro_max_posts_per_month: number
  premium_max_posts_per_month: number

  // Notifications
  notify_new_user: boolean
  notify_new_payment: boolean
  notify_cancellation: boolean
  notify_system_error: boolean
  admin_notification_email: string

  // Security
  require_2fa_admin: boolean
  login_attempt_limit: number
  enable_audit_log: boolean
  session_timeout: number

  // Email
  email_provider: string
  email_from: string
  email_from_name: string
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
}

// Cache de configurações em memória (válido por 5 minutos)
let settingsCache: { data: Partial<AppSettings> | null; timestamp: number } = {
  data: null,
  timestamp: 0,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Buscar todas as configurações do sistema
 * Com cache de 5 minutos para performance
 */
export async function getSettings(): Promise<Partial<AppSettings>> {
  // Verificar cache
  const now = Date.now()
  if (settingsCache.data && now - settingsCache.timestamp < CACHE_DURATION) {
    return settingsCache.data
  }

  try {
    const supabase = await createServerClient()

    const { data, error } = await (supabase
      .from('app_settings') as any)
      .select('key, value')

    if (error) {
      console.error('Erro ao buscar configurações:', error)
      return {}
    }

    const settings: any = {}
    data?.forEach((setting: any) => {
      settings[setting.key] = setting.value
    })

    // Atualizar cache
    settingsCache = {
      data: settings,
      timestamp: now,
    }

    return settings
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return {}
  }
}

/**
 * Buscar uma configuração específica
 */
export async function getSetting<K extends keyof AppSettings>(
  key: K
): Promise<AppSettings[K] | undefined> {
  const settings = await getSettings()
  return settings[key]
}

/**
 * Invalidar cache de configurações
 * Chamar isso após atualizar configurações
 */
export function invalidateSettingsCache() {
  settingsCache = {
    data: null,
    timestamp: 0,
  }
}

/**
 * Verificar se o app está em modo de manutenção
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const maintenanceMode = await getSetting('maintenance_mode')
  return maintenanceMode === true
}

/**
 * Obter limite de ideias para um plano
 */
export async function getIdeaLimit(planType: string): Promise<number> {
  switch (planType) {
    case 'free':
      return (await getSetting('free_max_ideas')) ?? 10
    case 'pro':
      return (await getSetting('pro_max_ideas')) ?? 50
    case 'premium':
      return (await getSetting('premium_max_ideas')) ?? -1
    default:
      return 10
  }
}

/**
 * Obter limite de posts por mês para um plano
 */
export async function getPostLimit(planType: string): Promise<number> {
  switch (planType) {
    case 'free':
      return (await getSetting('free_max_posts_per_month')) ?? 5
    case 'pro':
      return (await getSetting('pro_max_posts_per_month')) ?? 30
    case 'premium':
      return (await getSetting('premium_max_posts_per_month')) ?? -1
    default:
      return 5
  }
}
