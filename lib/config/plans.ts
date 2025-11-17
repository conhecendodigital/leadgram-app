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
      'Até 10 ideias por mês',
      'Análise básica de métricas',
      'Suporte por email',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49,
    monthlyPrice: 49,
    color: 'gradient-primary',
    features: [
      'Ideias ilimitadas',
      'Análise avançada de métricas',
      'Integração com Instagram',
      'Exportação de relatórios',
      'Suporte prioritário',
    ],
  },
  premium: {
    name: 'Premium',
    price: 99,
    monthlyPrice: 99,
    color: 'gradient-primary',
    features: [
      'Tudo do Pro +',
      'Multi-plataformas',
      'API de automação',
      'Suporte 24/7',
      'Consultoria mensal',
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
