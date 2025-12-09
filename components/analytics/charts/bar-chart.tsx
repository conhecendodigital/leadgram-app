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
  label: string        // Label para exibição (ex: "Seg" ou "Sem 1")
  periodStart: string  // Data de início do período
  periodEnd: string    // Data de fim do período
  value: number
}

interface BarChartComponentProps {
  data: DataPoint[]
  color?: string
  height?: number
  showAverage?: boolean
  formatValue?: (value: number) => string
  metricLabel?: string  // Label da métrica (ex: "Curtidas", "Engajamento")
}

export default function BarChartComponent({
  data,
  color = '#EF4444',
  height = 200,
  showAverage = true,
  formatValue = formatNumber,
  metricLabel = 'Curtidas',
}: BarChartComponentProps) {
  // Calcular média para linha de referência
  const average = useMemo(() => {
    if (!data || data.length === 0) return 0
    const sum = data.reduce((acc, d) => acc + d.value, 0)
    return sum / data.length
  }, [data])

  // Encontrar valor máximo para destacar
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0
    return Math.max(...data.map(d => d.value))
  }, [data])

  // Formatar data para exibição no tooltip
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    // Se é o mesmo dia (filtro semana)
    if (start === end) {
      return `${days[startDate.getDay()]}, ${startDate.getDate()} ${months[startDate.getMonth()]}`
    }

    // Se é um período (filtro mês)
    return `${startDate.getDate()} ${months[startDate.getMonth()]} - ${endDate.getDate()} ${months[endDate.getMonth()]}`
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickLine={false}
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
            const isPeriod = dataPoint.periodStart !== dataPoint.periodEnd
            return (
              <div className="bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl">
                <p className="text-xs text-gray-400 mb-1">
                  {isPeriod ? `Até ${formatDateRange(dataPoint.periodStart, dataPoint.periodEnd).split(' - ')[1]}` : formatDateRange(dataPoint.periodStart, dataPoint.periodEnd)}
                </p>
                <p className="text-xl font-bold" style={{ color }}>
                  {formatValue(dataPoint.value)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {metricLabel} acumuladas
                </p>
              </div>
            )
          }}
        />
        {showAverage && (
          <ReferenceLine
            y={average}
            stroke="#9CA3AF"
            strokeDasharray="5 5"
            label={{
              value: `Média: ${formatValue(average)}`,
              position: 'right',
              fill: '#6B7280',
              fontSize: 10,
            }}
          />
        )}
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value === maxValue ? '#F97316' : color}
              fillOpacity={entry.value === maxValue ? 1 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
