'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from 'recharts'
import { formatNumber } from '@/lib/analytics/metrics'

interface DataPoint {
  label: string        // Label para exibição (ex: "Seg" ou "Sem 1")
  periodStart: string  // Data de início do período
  periodEnd: string    // Data de fim do período
  value: number
}

interface LollipopChartProps {
  data: DataPoint[]
  color?: string
  height?: number
  formatValue?: (value: number) => string
  metricLabel?: string  // Label da métrica (ex: "Comentários")
}

export default function LollipopChart({
  data,
  color = '#06B6D4',
  height = 200,
  formatValue = formatNumber,
  metricLabel = 'Comentários',
}: LollipopChartProps) {
  // Encontrar picos (valores acima da média + 1 desvio padrão)
  const { processedData } = useMemo(() => {
    if (!data || data.length === 0) return { processedData: [] }

    const values = data.map(d => d.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length)
    const threshold = avg + stdDev

    return {
      processedData: data.map(d => ({
        ...d,
        isPeak: d.value > threshold,
      })),
    }
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

  if (!processedData || processedData.length === 0) {
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
      <ComposedChart data={processedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
            const dataPoint = payload[0].payload
            const isPeriod = dataPoint.periodStart !== dataPoint.periodEnd
            return (
              <div className="bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl">
                <p className="text-xs text-gray-400 mb-1">
                  {isPeriod ? `Até ${formatDateRange(dataPoint.periodStart, dataPoint.periodEnd).split(' - ')[1]}` : formatDateRange(dataPoint.periodStart, dataPoint.periodEnd)}
                </p>
                <p className="text-xl font-bold" style={{ color: dataPoint.isPeak ? '#F97316' : color }}>
                  {formatValue(dataPoint.value)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {metricLabel} acumulados
                </p>
              </div>
            )
          }}
        />
        {/* Barras finas (lollipop stems) */}
        <Bar
          dataKey="value"
          fill={color}
          fillOpacity={0.6}
          barSize={4}
          radius={[2, 2, 0, 0]}
        />
        {/* Círculos no topo (lollipop heads) */}
        <Scatter
          dataKey="value"
          fill={color}
          shape={(props: any) => {
            const { cx, cy, payload } = props
            const isPeak = payload.isPeak
            return (
              <circle
                cx={cx}
                cy={cy}
                r={isPeak ? 8 : 6}
                fill={isPeak ? '#F97316' : color}
                stroke="#fff"
                strokeWidth={2}
              />
            )
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
