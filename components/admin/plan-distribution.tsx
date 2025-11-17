'use client'

import { m } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
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

  const total = subscriptions.length || 1

  const data = [
    { name: 'Free', value: planCounts.free || 0, color: '#6B7280' },
    { name: 'Pro', value: planCounts.pro || 0, color: '#8B5CF6' },
    { name: 'Premium', value: planCounts.premium || 0, color: '#EC4899' },
  ]

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          <p className="text-xs text-gray-600">{data.value} usuários ({percentage}%)</p>
        </div>
      )
    }
    return null
  }

  return (
    <m.div
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

      {/* Gráfico de Pizza */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Customizada */}
      <div className="grid grid-cols-3 gap-4">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <m.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {item.value}
              </p>
              <p className="text-xs text-gray-500">
                {percentage}%
              </p>
            </m.div>
          )
        })}
      </div>
    </m.div>
  )
}
