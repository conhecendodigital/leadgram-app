/**
 * Configuração dos planos de assinatura
 * Centraliza os preços, features e informações dos planos
 */

export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    monthlyPrice: 0,
    color: 'from-gray-500 to-gray-600',
    features: [
      '20 ideias por mês',
      '5 posts sincronizados/mês',
      'Métricas do Instagram',
      'Dashboard básico',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49,
    monthlyPrice: 49,
    color: 'gradient-primary',
    features: [
      '100 ideias por mês',
      '30 posts sincronizados/mês',
      'Métricas completas',
      'Upload para Google Drive',
      'Explorar perfis públicos',
      'Suporte por email',
    ],
  },
  premium: {
    name: 'Premium',
    price: 99,
    monthlyPrice: 99,
    color: 'from-orange-500 to-pink-600',
    features: [
      'Ideias ilimitadas',
      'Posts ilimitados',
      'Métricas completas',
      'Upload para Google Drive',
      'Explorar perfis públicos',
      'Suporte prioritário',
    ],
  },
} as const

export type PlanType = keyof typeof PLAN_CONFIG

/**
 * Calcula a receita mensal com base nas assinaturas
 */
export function calculateMonthlyRevenue(subscriptions: any[]): number {
  return subscriptions.reduce((sum: number, sub: any) => {
    if (sub.status === 'active') {
      const planType = sub.plan_type as PlanType
      const planConfig = PLAN_CONFIG[planType]
      if (planConfig) {
        return sum + planConfig.monthlyPrice
      }
    }
    return sum
  }, 0)
}

/**
 * Obtém o preço de um plano específico
 */
export function getPlanPrice(planType: PlanType): number {
  return PLAN_CONFIG[planType]?.monthlyPrice || 0
}
