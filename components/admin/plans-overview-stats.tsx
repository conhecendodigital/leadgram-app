'use client'

import { m } from 'framer-motion'
import { Package, Users, TrendingUp, DollarSign } from 'lucide-react'

interface PlansOverviewStatsProps {
  totalPlans: number
  totalSubscriptions: number
  conversionRate: string
  totalMRR: number
}

export default function PlansOverviewStats({
  totalPlans,
  totalSubscriptions,
  conversionRate,
  totalMRR,
}: PlansOverviewStatsProps) {
  const stats = [
    {
      icon: Package,
      label: 'Total de Planos',
      value: totalPlans,
      description: 'Planos ativos',
      gradient: 'gradient-primary',
      delay: 0.1,
    },
    {
      icon: Users,
      label: 'Assinaturas',
      value: totalSubscriptions,
      description: 'Total de assinantes',
      gradient: 'from-green-500 to-green-600',
      delay: 0.2,
    },
    {
      icon: DollarSign,
      label: 'MRR Total',
      value: `R$ ${totalMRR.toFixed(2)}`,
      description: 'Receita recorrente mensal',
      gradient: 'from-emerald-500 to-emerald-600',
      delay: 0.25,
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      description: 'Free para pago',
      gradient: 'gradient-primary',
      delay: 0.3,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <m.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stat.delay }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {stat.label}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {stat.value}
          </p>
          <p className="text-sm text-gray-500">
            {stat.description}
          </p>
        </m.div>
      ))}
    </div>
  )
}
