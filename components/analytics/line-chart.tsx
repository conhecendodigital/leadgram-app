'use client'

import { useMemo } from 'react'

interface DataPoint {
  date: string
  value: number
  label?: string
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  gradientFrom?: string
  gradientTo?: string
  height?: number
  showGrid?: boolean
  showLabels?: boolean
  showTooltip?: boolean
  formatValue?: (value: number) => string
  formatDate?: (date: string) => string
}

export default function LineChart({
  data,
  color = '#8B5CF6',
  gradientFrom,
  gradientTo,
  height = 200,
  showGrid = true,
  showLabels = true,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  formatDate = (d) => {
    const date = new Date(d)
    return `${date.getDate()}/${date.getMonth() + 1}`
  },
}: LineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const values = data.map(d => d.value)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const range = maxValue - minValue || 1

    // Padding para não encostar nas bordas
    const padding = { top: 20, right: 10, bottom: 30, left: 10 }
    const chartWidth = 100 // Porcentagem
    const chartHeight = height - padding.top - padding.bottom

    // Calcular pontos do gráfico
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = padding.top + chartHeight - ((d.value - minValue) / range) * chartHeight
      return { x, y, ...d }
    })

    // Criar path da linha
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')

    // Criar path da área preenchida
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`

    // Calcular linhas de grid horizontais
    const gridLines = []
    const gridCount = 4
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (chartHeight / gridCount) * i
      const value = maxValue - (range / gridCount) * i
      gridLines.push({ y, value })
    }

    return { points, linePath, areaPath, maxValue, minValue, gridLines, padding }
  }, [data, height])

  if (!chartData || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl"
        style={{ height }}
      >
        <p className="text-gray-400 text-sm">Sem dados disponíveis</p>
      </div>
    )
  }

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
  const areaGradientId = `area-${gradientId}`

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          {/* Gradiente para a linha */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientFrom || color} />
            <stop offset="100%" stopColor={gradientTo || color} />
          </linearGradient>

          {/* Gradiente para a área */}
          <linearGradient id={areaGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Linhas de grid horizontais */}
        {showGrid && chartData.gridLines.map((line, i) => (
          <line
            key={i}
            x1="0"
            y1={line.y}
            x2="100"
            y2={line.y}
            stroke="#E5E7EB"
            strokeWidth="0.3"
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Área preenchida */}
        <path
          d={chartData.areaPath}
          fill={`url(#${areaGradientId})`}
        />

        {/* Linha do gráfico */}
        <path
          d={chartData.linePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Pontos */}
        {chartData.points.map((point, i) => (
          <g key={i}>
            {/* Ponto maior para hover */}
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="white"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            />
          </g>
        ))}
      </svg>

      {/* Labels de data */}
      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1">
          <span>{formatDate(data[0].date)}</span>
          {data.length > 2 && (
            <span className="hidden sm:inline">
              {formatDate(data[Math.floor(data.length / 2)].date)}
            </span>
          )}
          <span>{formatDate(data[data.length - 1].date)}</span>
        </div>
      )}

      {/* Valor máximo e mínimo */}
      <div className="absolute top-0 right-0 text-xs text-gray-500 bg-white/80 px-1 rounded">
        {formatValue(chartData.maxValue)}
      </div>
      <div className="absolute bottom-6 right-0 text-xs text-gray-500 bg-white/80 px-1 rounded">
        {formatValue(chartData.minValue)}
      </div>
    </div>
  )
}
