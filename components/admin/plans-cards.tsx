'use client'

import { m } from 'framer-motion'

interface Plan {
  name: string
  type: string
  price: string
  period: string
  users: number
  color: string
  features: readonly string[]
  mrr: number
  growth: string
}

interface PlansCardsProps {
  plans: Plan[]
  totalSubscriptions: number
}

export default function PlansCards({ plans, totalSubscriptions }: PlansCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan, index) => (
        <m.div
          key={plan.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
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
              <m.div
                initial={{ width: 0 }}
                animate={{
                  width: `${totalSubscriptions ? (plan.users / totalSubscriptions) * 100 : 0}%`,
                }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                className={`bg-gradient-to-r ${plan.color} h-2 rounded-full`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalSubscriptions
                ? ((plan.users / totalSubscriptions) * 100).toFixed(1)
                : 0}% do total
            </p>
          </div>

          {/* Advanced Metrics */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  MRR (Mensal)
                </p>
                <p className="text-lg font-bold text-gray-900">
                  R$ {plan.mrr.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Crescimento
                </p>
                <p className={`text-lg font-bold ${parseFloat(plan.growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(plan.growth) >= 0 ? '+' : ''}{plan.growth}%
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Recursos Inclusos:
            </h4>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <m.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 + i * 0.05 }}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-green-500 mt-0.5">✓</span>
                  {feature}
                </m.li>
              ))}
            </ul>
          </div>
        </m.div>
      ))}
    </div>
  )
}
