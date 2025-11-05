import { createServerClient } from '@/lib/supabase/server'
import { Package, Users, TrendingUp } from 'lucide-react'

export default async function AdminPlansPage() {
  const supabase = await createServerClient()

  // Buscar estatísticas de planos
  const { data: subscriptions } = await (supabase
    .from('user_subscriptions') as any)
    .select('*')

  // Calcular estatísticas por plano
  const planStats = {
    free: subscriptions?.filter((s: any) => s.plan_type === 'free').length || 0,
    pro: subscriptions?.filter((s: any) => s.plan_type === 'pro').length || 0,
    premium: subscriptions?.filter((s: any) => s.plan_type === 'premium').length || 0,
  }

  const plans = [
    {
      name: 'Free',
      type: 'free',
      price: 'R$ 0',
      period: '/mês',
      users: planStats.free,
      color: 'from-gray-500 to-gray-600',
      features: [
        'Até 10 ideias por mês',
        'Análise básica de métricas',
        'Suporte por email',
      ],
    },
    {
      name: 'Pro',
      type: 'pro',
      price: 'R$ 49',
      period: '/mês',
      users: planStats.pro,
      color: 'gradient-primary',
      features: [
        'Ideias ilimitadas',
        'Análise avançada de métricas',
        'Integração com Instagram',
        'Exportação de relatórios',
        'Suporte prioritário',
      ],
    },
    {
      name: 'Premium',
      type: 'premium',
      price: 'R$ 99',
      period: '/mês',
      users: planStats.premium,
      color: 'gradient-primary',
      features: [
        'Tudo do Pro +',
        'Multi-plataformas',
        'API de automação',
        'Suporte 24/7',
        'Consultoria mensal',
      ],
    },
  ]

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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Total de Planos
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {plans.length}
          </p>
          <p className="text-sm text-gray-500">
            Planos ativos
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Assinaturas
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {subscriptions?.length || 0}
          </p>
          <p className="text-sm text-gray-500">
            Total de assinantes
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Taxa de Conversão
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {subscriptions?.length
              ? (((planStats.pro + planStats.premium) / subscriptions.length) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-sm text-gray-500">
            Free para pago
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.type}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-lg opacity-80">{plan.period}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Usuários Ativos
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {plan.users}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${plan.color} h-2 rounded-full transition-all`}
                  style={{
                    width: `${subscriptions?.length ? (plan.users / subscriptions.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {subscriptions?.length
                  ? ((plan.users / subscriptions.length) * 100).toFixed(1)
                  : 0}% do total
              </p>
            </div>

            {/* Features */}
            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Recursos Inclusos:
              </h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-green-500 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
