'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '@/lib/analytics/metrics'

interface DataPoint {
  date: string
  value: number
}

interface AreaChartComponentProps {
  data: DataPoint[]
  color?: string
  gradientFrom?: string
  gradientTo?: string
  height?: number
  formatValue?: (value: number) => string
}

export default function AreaChartComponent({
  data,
  color = '#3B82F6',
  gradientFrom,
  gradientTo,
  height = 200,
  formatValue = formatNumber,
}: AreaChartComponentProps) {
  // Formatar data para exibição
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl"
        style={{ height }}
      >
        <p className="text-gray-400 text-sm">Sem dados disponíveis</p>
      </div>
    )
  }

  const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom || color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={gradientTo || color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => formatValue(v)}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload[0]) return null
            const dataPoint = payload[0].payload as DataPoint
            return (
              <div className="bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl">
                <p className="text-xs text-gray-400 mb-1">
                  {formatDateFull(dataPoint.date)}
                </p>
                <p className="text-xl font-bold" style={{ color }}>
                  {formatValue(dataPoint.value)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Impressões</p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
