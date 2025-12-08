'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { formatNumber } from '@/lib/analytics/metrics'

interface DataPoint {
  date: string
  value: number
}

interface FollowersChartProps {
  data: DataPoint[]
  height?: number
  formatValue?: (value: number) => string
}

export default function FollowersChart({
  data,
  height = 200,
  formatValue = formatNumber,
}: FollowersChartProps) {
  // Calcular crescimento líquido (diferença entre dias consecutivos)
  const growthData = useMemo(() => {
    if (!data || data.length < 2) return []

    return data.slice(1).map((current, index) => {
      const previous = data[index]
      const growth = current.value - previous.value
      return {
        date: current.date,
        value: growth,
        total: current.value,
      }
    })
  }, [data])

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

  if (!growthData || growthData.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl"
        style={{ height }}
      >
        <p className="text-gray-400 text-sm">Sem dados disponíveis</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          tickFormatter={(v) => (v >= 0 ? `+${v}` : `${v}`)}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload[0]) return null
            const dataPoint = payload[0].payload
            const isPositive = dataPoint.value >= 0
            return (
              <div className="bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl">
                <p className="text-xs text-gray-400 mb-1">
                  {formatDateFull(dataPoint.date)}
                </p>
                <p className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{dataPoint.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Total: {formatValue(dataPoint.total)} seguidores
                </p>
              </div>
            )
          }}
        />
        <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1} />
        <Bar dataKey="value" radius={[4, 4, 4, 4]} maxBarSize={30}>
          {growthData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= 0 ? '#10B981' : '#EF4444'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
