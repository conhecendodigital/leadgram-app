'use client'

import { useMemo, useState, useRef, useCallback } from 'react'

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
  formatValue?: (value: number) => string
  formatDate?: (date: string) => string
  title?: string
  subtitle?: string
}

// Função para criar path suavizado (curva bezier) - definida fora do componente
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''

  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 >= points.length ? i + 1 : i + 2]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return path
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
  title,
  subtitle,
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const values = data.map(d => d.value)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const range = maxValue - minValue || 1

    // Padding para não encostar nas bordas
    const padding = { top: 20, right: 10, bottom: 30, left: 10 }
    const chartHeight = height - padding.top - padding.bottom

    // Calcular pontos do gráfico
    const points = data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50
      const y = padding.top + chartHeight - ((d.value - minValue) / range) * chartHeight
      return { x, y, ...d }
    })

    // Criar path da linha suavizada (curva)
    const linePath = points.length > 1
      ? createSmoothPath(points)
      : `M ${points[0].x} ${points[0].y}`

    // Criar path da área preenchida
    const areaPath = points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
      : ''

    // Calcular linhas de grid horizontais
    const gridLines = []
    const gridCount = 4
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (chartHeight / gridCount) * i
      const value = maxValue - (range / gridCount) * i
      gridLines.push({ y, value })
    }

    // Estatísticas
    const total = values.reduce((a, b) => a + b, 0)
    const avg = total / values.length
    const nonZeroValues = values.filter(v => v > 0)
    const min = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0

    return { points, linePath, areaPath, maxValue, minValue: min, gridLines, padding, avg, total }
  }, [data, height])

  // Handler para movimento do mouse
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !chartData) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const relativeX = (x / rect.width) * 100

    // Encontrar o ponto mais próximo
    let closestIndex = 0
    let closestDistance = Infinity

    chartData.points.forEach((point, index) => {
      const distance = Math.abs(point.x - relativeX)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    setHoveredPoint(closestIndex)
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [chartData])

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null)
    setMousePos(null)
  }, [])

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
  const hoveredData = hoveredPoint !== null ? chartData.points[hoveredPoint] : null

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
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
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
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

        {/* Linha vertical do hover */}
        {hoveredPoint !== null && chartData.points[hoveredPoint] && (
          <line
            x1={chartData.points[hoveredPoint].x}
            y1={chartData.padding.top}
            x2={chartData.points[hoveredPoint].x}
            y2={height - chartData.padding.bottom}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="4,4"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
          />
        )}

        {/* Área preenchida */}
        {chartData.areaPath && (
          <path
            d={chartData.areaPath}
            fill={`url(#${areaGradientId})`}
          />
        )}

        {/* Linha do gráfico */}
        <path
          d={chartData.linePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Pontos - apenas o hover ativo */}
        {chartData.points.map((point, i) => (
          <g key={i}>
            {/* Ponto pequeno sempre visível */}
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === i ? "4" : "0"}
              fill="white"
              stroke={color}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-150"
            />
            {/* Anel externo no hover */}
            {hoveredPoint === i && (
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={color}
                opacity="0.2"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip flutuante */}
      {hoveredData && mousePos && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: Math.min(mousePos.x, (containerRef.current?.clientWidth || 300) - 150),
            top: Math.max(mousePos.y - 80, 10),
            transform: mousePos.x > (containerRef.current?.clientWidth || 300) / 2 ? 'translateX(-100%)' : 'translateX(0)',
          }}
        >
          <div className="bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl min-w-[140px]">
            <p className="text-xs text-gray-400 mb-1">
              {formatDateFull(hoveredData.date)}
            </p>
            <p className="text-xl font-bold" style={{ color }}>
              {formatValue(hoveredData.value)}
            </p>
            {title && (
              <p className="text-xs text-gray-400 mt-1">{title}</p>
            )}
          </div>
          {/* Seta do tooltip */}
          <div
            className="absolute w-3 h-3 bg-gray-900 rotate-45"
            style={{
              bottom: -6,
              left: mousePos.x > (containerRef.current?.clientWidth || 300) / 2 ? 'auto' : 20,
              right: mousePos.x > (containerRef.current?.clientWidth || 300) / 2 ? 20 : 'auto',
            }}
          />
        </div>
      )}

      {/* Labels de data */}
      {showLabels && data.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1">
          <span>{formatDate(data[0].date)}</span>
          {data.length > 2 && (
            <span className="hidden sm:inline">
              {formatDate(data[Math.floor(data.length / 2)].date)}
            </span>
          )}
          {data.length > 1 && (
            <span>{formatDate(data[data.length - 1].date)}</span>
          )}
        </div>
      )}

      {/* Valores de referência à direita */}
      <div className="absolute top-0 right-0 text-xs text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
        {formatValue(chartData.maxValue)}
      </div>
      <div className="absolute bottom-6 right-0 text-xs text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
        {formatValue(chartData.minValue)}
      </div>
    </div>
  )
}

// Função auxiliar para formatar data completa
function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
