'use client'

import { TrendingUp, TrendingDown, Users, Eye, Heart, MessageCircle } from 'lucide-react'

export default function AnalyticsOverview() {
  const stats = [
    {
      label: 'Total de Visualizações',
      value: '127.5K',
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Engajamento',
      value: '8.9K',
      change: '+8.3%',
      trend: 'up',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Novos Seguidores',
      value: '2.4K',
      change: '+23.1%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Comentários',
      value: '1.2K',
      change: '-4.2%',
      trend: 'down',
      icon: MessageCircle,
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                stat.trend === 'up'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}
            >
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {stat.change}
            </div>
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
