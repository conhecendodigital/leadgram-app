'use client'

import { Users, UserCheck, UserPlus, UserX } from 'lucide-react'
import { motion } from 'framer-motion'

interface CustomersStatsProps {
  users: any[]
}

export default function CustomersStats({ users }: CustomersStatsProps) {
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.user_subscriptions?.[0]?.status === 'active').length
  const newThisMonth = users.filter(u => {
    const createdDate = new Date(u.created_at)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
  }).length
  const inactiveUsers = totalUsers - activeUsers

  const stats = [
    {
      label: 'Total de Clientes',
      value: totalUsers.toString(),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Clientes Ativos',
      value: activeUsers.toString(),
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Novos este Mês',
      value: newThisMonth.toString(),
      icon: UserPlus,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Inativos',
      value: inactiveUsers.toString(),
      icon: UserX,
      color: 'from-gray-500 to-gray-600',
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
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
        >
          <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl w-fit mb-4`}>
            <stat.icon className="w-6 h-6 text-white" />
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
