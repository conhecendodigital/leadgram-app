'use client'

import { Users, UserPlus, Grid3x3, TrendingUp } from 'lucide-react'

interface ProfileStatsProps {
  profile: any
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  // Calcular média de engajamento
  const avgEngagement = profile.posts && profile.posts.length > 0
    ? (profile.posts.reduce((sum: number, p: any) => sum + p.engagement_rate, 0) / profile.posts.length).toFixed(2)
    : '0.00'

  const stats = [
    {
      label: 'Seguidores',
      value: profile.followers?.toLocaleString('pt-BR') || '0',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Seguindo',
      value: profile.following?.toLocaleString('pt-BR') || '0',
      icon: UserPlus,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Publicações',
      value: profile.media_count?.toLocaleString('pt-BR') || '0',
      icon: Grid3x3,
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Engajamento Médio',
      value: `${avgEngagement}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 md:p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
              <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>

          <div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
