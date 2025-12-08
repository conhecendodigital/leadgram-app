'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatNumber, formatPercentage } from '@/lib/analytics/metrics'

interface DataPoint {
  date: string
  value: number
  reach?: number
  followers?: number
}

interface EngagementComboChartProps {
  data: DataPoint[]
  reachData?: DataPoint[]
  followersCount?: number
  height?: number
}

export default function EngagementComboChart({
  data,
  reachData,
  followersCount = 0,
  height = 200,
}: EngagementComboChartProps) {
  // Calcular taxa de engajamento para cada dia
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Criar mapa de reach por data
    const reachMap = new Map<string, number>()
    if (reachData) {
      reachData.forEach(d => {
        reachMap.set(d.date, d.value)
      })
    }

    return data.map(d => {
      const reach = reachMap.get(d.date) || 0
      // Taxa de engajamento: interações / alcance * 100 (ou seguidores se não tiver reach)
      const base = reach > 0 ? reach : followersCount
      const rate = base > 0 ? (d.value / base) * 100 : 0

      return {
        date: d.date,
        engagement: d.value,
        rate: Math.min(rate, 100), // Limitar a 100%
      }
    })
  }, [data, reachData, followersCount])

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

  if (!chartData || chartData.length === 0) {
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
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
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
          yAxisId="left"
          tickFormatter={(v) => formatNumber(v)}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v) => `${v.toFixed(1)}%`}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={45}
          domain={[0, 'auto']}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload[0]) return null
            const dataPoint = payload[0].payload
            return (
              <div className="bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl min-w-[160px]">
                <p className="text-xs text-gray-400 mb-2">
                  {formatDateFull(dataPoint.date)}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-400">Interações</span>
                    <span className="font-bold text-pink-400">{formatNumber(dataPoint.engagement)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-400">Taxa</span>
                    <span className="font-bold text-purple-400">{formatPercentage(dataPoint.rate)}</span>
                  </div>
                </div>
              </div>
            )
          }}
        />
        <Legend
          verticalAlign="top"
          height={30}
          formatter={(value) => (
            <span className="text-xs text-gray-600">
              {value === 'engagement' ? 'Interações' : 'Taxa de Engajamento'}
            </span>
          )}
        />
        <Bar
          yAxisId="left"
          dataKey="engagement"
          fill="#EC4899"
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
          maxBarSize={30}
          name="engagement"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="rate"
          stroke="#8B5CF6"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
          name="rate"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
