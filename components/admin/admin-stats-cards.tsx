'use client'

import { Users, DollarSign, TrendingUp, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'

interface AdminStatsCardsProps {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
}

export default function AdminStatsCards({
  totalUsers,
  activeSubscriptions,
  monthlyRevenue,
}: AdminStatsCardsProps) {
  const stats = [
    {
      label: 'Total de Usuários',
      value: totalUsers.toString(),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Assinaturas Ativas',
      value: activeSubscriptions.toString(),
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      change: '+8%',
      trend: 'up',
    },
    {
      label: 'Receita Mensal',
      value: `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      change: '+23%',
      trend: 'up',
    },
    {
      label: 'Taxa de Conversão',
      value: '4.8%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      change: '+2.1%',
      trend: 'up',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {stat.change}
            </div>
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
