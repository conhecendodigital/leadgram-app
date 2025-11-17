'use client'

import { m } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign } from 'lucide-react'

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Se não houver dados, mostrar gráfico vazio
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 0 },
    { month: 'Fev', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Abr', revenue: 0 },
    { month: 'Mai', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ]

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Receita Mensal
          </h3>
          <p className="text-sm text-gray-600">
            Últimos 6 meses
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </m.div>
  )
}
