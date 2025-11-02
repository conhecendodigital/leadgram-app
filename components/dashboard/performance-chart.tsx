'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Calendar } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PerformanceChartProps {
  ideas: any[]
}

export default function PerformanceChart({ ideas }: PerformanceChartProps) {
  // Gerar dados dos últimos 7 dias
  const generateChartData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayIdeas = ideas.filter((idea) => {
        const ideaDate = new Date(idea.created_at)
        return ideaDate.toDateString() === date.toDateString() && idea.status === 'posted'
      })

      const views = dayIdeas.reduce((sum, idea) => {
        const metrics = idea.idea_platforms?.[0]?.metrics?.[0]
        return sum + (metrics?.views || 0)
      }, 0)

      const likes = dayIdeas.reduce((sum, idea) => {
        const metrics = idea.idea_platforms?.[0]?.metrics?.[0]
        return sum + (metrics?.likes || 0)
      }, 0)

      const comments = dayIdeas.reduce((sum, idea) => {
        const metrics = idea.idea_platforms?.[0]?.metrics?.[0]
        return sum + (metrics?.comments || 0)
      }, 0)

      data.push({
        date: format(date, 'EEE', { locale: ptBR }),
        views,
        likes,
        comments,
      })
    }
    return data
  }

  const chartData = generateChartData()

  // Se não houver dados, mostrar placeholder
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Performance</h3>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe suas métricas ao longo do tempo
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              Últimos 7 dias
            </span>
          </div>
        </div>

        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado disponível ainda</p>
            <p className="text-sm mt-2">Poste conteúdos para ver suas métricas</p>
          </div>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 dark:bg-gray-800/95 dark:border-gray-700 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{payload[0].payload.date}</p>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-shadow"
      data-tour="chart"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Desempenho da Semana
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visualizações, curtidas e comentários
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            Últimos 7 dias
          </span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            />
            <Area
              type="monotone"
              dataKey="views"
              name="Visualizações"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
            <Area
              type="monotone"
              dataKey="likes"
              name="Curtidas"
              stroke="#ec4899"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLikes)"
            />
            <Area
              type="monotone"
              dataKey="comments"
              name="Comentários"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorComments)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
