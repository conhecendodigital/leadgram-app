'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
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

type PeriodType = 7 | 30 | 90

interface PerformanceChartProps {
  ideas: any[]
}

export default function PerformanceChart({ ideas }: PerformanceChartProps) {
  const [period, setPeriod] = useState<PeriodType>(7)

  // Gerar dados baseado no período selecionado
  const generateChartData = () => {
    const data = []
    for (let i = period - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayIdeas = ideas.filter((idea) => {
        const ideaDate = new Date(idea.created_at)
        return ideaDate.toDateString() === date.toDateString() && idea.status === 'posted'
      })

      // Agregar métricas de TODAS as plataformas
      const views = dayIdeas.reduce((sum, idea) => {
        const v = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
          const latestMetric = platform.metrics?.[0]
          return pSum + (latestMetric?.views || 0)
        }, 0) || 0
        return sum + v
      }, 0)

      const likes = dayIdeas.reduce((sum, idea) => {
        const l = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
          const latestMetric = platform.metrics?.[0]
          return pSum + (latestMetric?.likes || 0)
        }, 0) || 0
        return sum + l
      }, 0)

      const comments = dayIdeas.reduce((sum, idea) => {
        const c = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
          const latestMetric = platform.metrics?.[0]
          return pSum + (latestMetric?.comments || 0)
        }, 0) || 0
        return sum + c
      }, 0)

      // Formato de data baseado no período
      const dateFormat = period === 7 ? 'EEE' : 'dd/MM'

      data.push({
        date: format(date, dateFormat, { locale: ptBR }),
        views,
        likes,
        comments,
      })
    }
    return data
  }

  const chartData = generateChartData()

  // Textos dinâmicos baseados no período
  const getPeriodText = () => {
    switch (period) {
      case 7:
        return 'Últimos 7 dias'
      case 30:
        return 'Últimos 30 dias'
      case 90:
        return 'Últimos 90 dias'
    }
  }

  const getChartTitle = () => {
    switch (period) {
      case 7:
        return 'Desempenho da Semana'
      case 30:
        return 'Desempenho do Mês'
      case 90:
        return 'Desempenho do Trimestre'
    }
  }

  // Se não houver dados, mostrar placeholder
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Performance</h3>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe suas métricas ao longo do tempo
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriod(days as PeriodType)}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${
                      period === days
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {days}d
                </button>
              ))}
            </div>
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
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.date}</p>
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
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow"
      data-tour="chart"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {getChartTitle()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Visualizações, curtidas e comentários
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days as PeriodType)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${
                    period === days
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {days}d
              </button>
            ))}
          </div>
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
    </m.div>
  )
}
