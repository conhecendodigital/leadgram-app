'use client'

import { useState } from 'react'
import { Check, Zap, Crown, Gift, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlanSettingsProps {
  subscription: any
}

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    icon: Gift,
    color: 'from-gray-500 to-gray-600',
    features: [
      '10 ideias por mês',
      '1 conta Instagram',
      'Métricas básicas',
      'Suporte comunitário'
    ]
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 49,
    icon: Zap,
    color: 'from-purple-600 to-pink-600',
    popular: true,
    features: [
      '100 ideias por mês',
      '3 contas Instagram',
      'Análise de concorrentes',
      'Auto-save de ideias',
      'Métricas avançadas',
      'Suporte prioritário'
    ]
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 99,
    icon: Crown,
    color: 'from-orange-500 to-pink-600',
    features: [
      'Ideias ilimitadas',
      '10 contas Instagram',
      'IA de sugestões avançada',
      'Análise preditiva',
      'Auto-agendamento',
      'Prioridade máxima no suporte',
      'Acesso antecipado a recursos'
    ]
  }
]

export default function PlanSettings({ subscription }: PlanSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const currentPlan = subscription?.plan_type || 'FREE'

  const handleUpgrade = async (planId: string) => {
    try {
      setLoading(planId)

      // Call Checkout API to create payment preference
      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId.toLowerCase() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      if (data.init_point) {
        // Redirect to Mercado Pago checkout
        window.location.href = data.init_point
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)
      alert(error.message || 'Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {currentPlan === 'FREE' && <Gift className="w-6 h-6" />}
              {currentPlan === 'PRO' && <Zap className="w-6 h-6" />}
              {currentPlan === 'PREMIUM' && <Crown className="w-6 h-6" />}
              <h3 className="text-2xl font-bold">Plano {currentPlan}</h3>
            </div>
            <p className="text-purple-100">
              {currentPlan === 'FREE' && 'Comece gratuitamente'}
              {currentPlan === 'PRO' && 'Para criadores profissionais'}
              {currentPlan === 'PREMIUM' && 'Máximo poder e recursos'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              R$ {plans.find(p => p.id === currentPlan)?.price}
            </div>
            <div className="text-purple-100">por mês</div>
          </div>
        </div>

        {subscription?.status === 'active' && subscription.current_period_end && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-sm">
              Próxima renovação: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrent = plan.id === currentPlan
          const canUpgrade = (
            (currentPlan === 'FREE' && (plan.id === 'PRO' || plan.id === 'PREMIUM')) ||
            (currentPlan === 'PRO' && plan.id === 'PREMIUM')
          )
          const canDowngrade = (
            (currentPlan === 'PREMIUM' && (plan.id === 'PRO' || plan.id === 'FREE')) ||
            (currentPlan === 'PRO' && plan.id === 'FREE')
          )

          return (
            <div
              key={plan.id}
              className={`
                relative bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 shadow-lg transition-all hover:shadow-xl
                ${isCurrent
                  ? 'border-purple-500 dark:border-purple-400 ring-4 ring-purple-100 dark:ring-purple-900'
                  : 'border-gray-200 dark:border-gray-700'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Mais Popular
                  </div>
                </div>
              )}

              {/* Current Badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Plano Atual
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    R$ {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => !isCurrent && canUpgrade && handleUpgrade(plan.id)}
                disabled={isCurrent || loading !== null || (!canUpgrade && !canDowngrade)}
                className={`
                  w-full py-3 px-4 rounded-xl font-semibold transition-all
                  ${isCurrent
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : canUpgrade
                    ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:scale-105`
                    : canDowngrade
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                  ${loading === plan.id ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                {loading === plan.id ? 'Processando...' :
                 isCurrent ? 'Plano Atual' :
                 canUpgrade ? `Fazer upgrade para ${plan.name}` :
                 canDowngrade ? `Mudar para ${plan.name}` :
                 'Indisponível'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Payment History */}
      {subscription && subscription.payment_history && subscription.payment_history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Histórico de Pagamentos
          </h3>
          <div className="space-y-3">
            {subscription.payment_history.map((payment: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {payment.plan_type} - R$ {payment.amount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className={`
                  px-3 py-1 rounded-full text-sm font-semibold
                  ${payment.status === 'approved'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  }
                `}>
                  {payment.status === 'approved' ? 'Aprovado' : 'Pendente'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Dica:</strong> Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
          As mudanças entram em vigor imediatamente e você será cobrado proporcionalmente.
        </p>
      </div>
    </div>
  )
}
