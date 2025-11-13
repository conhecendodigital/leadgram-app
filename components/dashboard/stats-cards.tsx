'use client'

import { Lightbulb, Video, CheckCircle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { m } from 'framer-motion'

interface StatsCardsProps {
  totalIdeas: number
  recordedIdeas: number
  postedIdeas: number
}

export default function StatsCards({
  totalIdeas,
  recordedIdeas,
  postedIdeas,
}: StatsCardsProps) {
  const stats = [
    {
      name: 'Total de Ideias',
      value: totalIdeas,
      icon: Lightbulb,
      gradient: 'from-yellow-400 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      name: 'Vídeos Gravados',
      value: recordedIdeas,
      icon: Video,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      change: '+8%',
      trend: 'up' as const,
    },
    {
      name: 'Vídeos Postados',
      value: postedIdeas,
      icon: CheckCircle,
      gradient: 'from-green-400 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      change: '+23%',
      trend: 'up' as const,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat, index) => (
        <m.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-white`}
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full blur-3xl`} />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>

              {/* Trend Badge */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stat.trend === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.name}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalIdeas > 0 ? (stat.value / totalIdeas) * 100 : 0}%` }}
                  transition={{ delay: index * 0.2, duration: 1 }}
                  className={`h-full bg-gradient-to-r ${stat.gradient}`}
                />
              </div>
            </div>
          </div>
        </m.div>
      ))}
    </div>
  )
}
