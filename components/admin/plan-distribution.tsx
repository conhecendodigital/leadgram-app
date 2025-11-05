'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Package } from 'lucide-react'

interface PlanDistributionProps {
  subscriptions: any[]
}

export default function PlanDistribution({ subscriptions }: PlanDistributionProps) {
  // Contar distribuição de planos
  const planCounts = subscriptions.reduce((acc, sub) => {
    const plan = sub.plan_type || 'free'
    acc[plan] = (acc[plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const data = [
    { name: 'Free', value: planCounts.free || 0, color: '#6B7280' },
    { name: 'Pro', value: planCounts.pro || 0, color: '#8B5CF6' },
    { name: 'Premium', value: planCounts.premium || 0, color: '#EC4899' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Distribuição de Planos
          </h3>
          <p className="text-sm text-gray-600">
            Assinaturas por plano
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
