'use client'

import { m } from 'framer-motion'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface PaymentsStatsProps {
  totalRevenue: number
  successfulPayments: number
  pendingPayments: number
  successRate: string
}

export default function PaymentsStats({
  totalRevenue,
  successfulPayments,
  pendingPayments,
  successRate,
}: PaymentsStatsProps) {
  const stats = [
    {
      icon: DollarSign,
      label: 'Receita Total',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      gradient: 'from-green-500 to-green-600',
      delay: 0.1,
    },
    {
      icon: CheckCircle,
      label: 'Pagamentos Aprovados',
      value: successfulPayments.toString(),
      gradient: 'gradient-primary',
      delay: 0.2,
    },
    {
      icon: Clock,
      label: 'Pendentes',
      value: pendingPayments.toString(),
      gradient: 'from-yellow-500 to-yellow-600',
      delay: 0.3,
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Sucesso',
      value: `${successRate}%`,
      gradient: 'from-red-500 to-red-600',
      delay: 0.4,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
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
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {stat.label}
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {stat.value}
          </p>
        </m.div>
      ))}
    </div>
  )
}
