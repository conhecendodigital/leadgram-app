import { createServerClient } from '@/lib/supabase/server'
import { PLAN_CONFIG, type PlanType } from '@/lib/config/plans'
import PlansOverviewStats from '@/components/admin/plans-overview-stats'
import PlansCards from '@/components/admin/plans-cards'

export default async function AdminPlansPage() {
  const supabase = await createServerClient()

  // Buscar estatísticas de planos (apenas assinaturas ativas)
  const { data: subscriptions, error } = await (supabase
    .from('user_subscriptions') as any)
    .select('*')
    .eq('status', 'active')

  // Calcular estatísticas por plano
  const planStats = {
    free: subscriptions?.filter((s: any) => s.plan_type === 'free').length || 0,
    pro: subscriptions?.filter((s: any) => s.plan_type === 'pro').length || 0,
    premium: subscriptions?.filter((s: any) => s.plan_type === 'premium').length || 0,
  }

  // Calcular MRR (Monthly Recurring Revenue) por plano
  const mrrByPlan = {
    free: planStats.free * PLAN_CONFIG.free.monthlyPrice,
    pro: planStats.pro * PLAN_CONFIG.pro.monthlyPrice,
    premium: planStats.premium * PLAN_CONFIG.premium.monthlyPrice,
  }

  const totalMRR = mrrByPlan.free + mrrByPlan.pro + mrrByPlan.premium

  // Buscar assinaturas do mês anterior para calcular crescimento
  const currentDate = new Date()
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  const { data: lastMonthSubs } = await (supabase
    .from('user_subscriptions') as any)
    .select('*')
    .eq('status', 'active')
    .lt('created_at', currentMonth.toISOString())

  const lastMonthStats = {
    free: lastMonthSubs?.filter((s: any) => s.plan_type === 'free').length || 0,
    pro: lastMonthSubs?.filter((s: any) => s.plan_type === 'pro').length || 0,
    premium: lastMonthSubs?.filter((s: any) => s.plan_type === 'premium').length || 0,
  }

  // Calcular crescimento
  const growth = {
    free: lastMonthStats.free ? (((planStats.free - lastMonthStats.free) / lastMonthStats.free) * 100).toFixed(1) : '0',
    pro: lastMonthStats.pro ? (((planStats.pro - lastMonthStats.pro) / lastMonthStats.pro) * 100).toFixed(1) : '0',
    premium: lastMonthStats.premium ? (((planStats.premium - lastMonthStats.premium) / lastMonthStats.premium) * 100).toFixed(1) : '0',
  }

  // Construir array de planos com dados da configuração + métricas avançadas
  const plans = Object.entries(PLAN_CONFIG).map(([type, config]) => ({
    name: config.name,
    type: type as PlanType,
    price: `R$ ${config.price}`,
    period: '/mês',
    users: planStats[type as PlanType] || 0,
    color: config.color,
    features: config.features,
    mrr: mrrByPlan[type as PlanType] || 0,
    growth: growth[type as PlanType] || '0',
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Planos
        </h1>
        <p className="text-gray-600">
          Gerencie os planos de assinatura disponíveis
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Erro ao Carregar Planos
              </h3>
              <p className="text-sm text-red-700">
                Ocorreu um erro ao buscar os dados dos planos. Por favor, tente novamente mais tarde.
              </p>
              {error.message && (
                <p className="text-xs text-red-600 mt-2 font-mono">
                  Detalhes: {error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {!error && (
        <>
          {/* Overview Stats */}
          <PlansOverviewStats
            totalPlans={plans.length}
            totalSubscriptions={subscriptions?.length || 0}
            conversionRate={
              subscriptions?.length
                ? (((planStats.pro + planStats.premium) / subscriptions.length) * 100).toFixed(1)
                : '0'
            }
            totalMRR={totalMRR}
          />

          {/* Plans Grid */}
          <PlansCards plans={plans} totalSubscriptions={subscriptions?.length || 0} />
        </>
      )}
    </div>
  )
}
