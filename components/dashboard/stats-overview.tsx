'use client'

import { m } from 'framer-motion'
import { Eye, Heart, MessageCircle, TrendingUp, Zap } from 'lucide-react'

interface StatsOverviewProps {
  totalIdeas: number
  totalViews: number
  totalLikes: number
  totalComments: number
  engagementRate: string
}

export default function StatsOverview({
  totalIdeas,
  totalViews,
  totalLikes,
  totalComments,
  engagementRate,
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Visualizações',
      value: totalViews.toLocaleString('pt-BR'),
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      change: '+12.5%',
      trend: 'up',
    },
    {
      label: 'Curtidas',
      value: totalLikes.toLocaleString('pt-BR'),
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
      change: '+8.2%',
      trend: 'up',
    },
    {
      label: 'Comentários',
      value: totalComments.toLocaleString('pt-BR'),
      icon: MessageCircle,
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
      change: '+15.3%',
      trend: 'up',
    },
    {
      label: 'Engajamento',
      value: `${engagementRate}%`,
      icon: Zap,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      change: '+5.7%',
      trend: 'up',
    },
    {
      label: 'Total de Conteúdos',
      value: totalIdeas.toString(),
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      change: '+23.1%',
      trend: 'up',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-tour="stats">
      {stats.map((stat, index) => (
        <m.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative"
        >
          {/* Card */}
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer`}>
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`} />

            {/* Icon */}
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>

            {/* Value */}
            <div className="relative">
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-gray-600">
                {stat.label}
              </p>

              {/* Change Badge */}
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-600">
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">vs. mês passado</span>
              </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000" />
          </div>
        </m.div>
      ))}
    </div>
  )
}
