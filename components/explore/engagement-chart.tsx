'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EngagementChartProps {
  posts: any[]
}

export default function EngagementChart({ posts }: EngagementChartProps) {
  // Preparar dados para o gráfico
  const chartData = posts
    .slice(0, 15) // Últimos 15 posts
    .reverse()
    .map((post, index) => ({
      index: index + 1,
      date: format(new Date(post.timestamp), 'dd/MM', { locale: ptBR }),
      engajamento: post.engagement_rate,
      curtidas: post.like_count,
      comentarios: post.comment_count,
    }))

  // Calcular médias
  const avgEngagement = posts.length > 0
    ? (posts.reduce((sum, p) => sum + p.engagement_rate, 0) / posts.length).toFixed(2)
    : '0.00'

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            Post #{payload[0].payload.index}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value.toLocaleString('pt-BR')}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            Evolução do Engajamento
          </h3>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Últimos 15 posts • Média: {avgEngagement}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="engajamento"
              name="Taxa de Engajamento (%)"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
