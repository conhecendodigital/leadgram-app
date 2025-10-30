'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Instagram, Youtube, Facebook } from 'lucide-react'

interface PlatformStat {
  name: string
  count: number
  icon: React.ElementType
  color: string
}

export default function PlatformStats() {
  const [stats, setStats] = useState<PlatformStat[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Buscar plataformas
        const { data: ideas } = await supabase
          .from('ideas')
          .select('id, platforms:idea_platforms(platform)')
          .eq('user_id', user.id)

        if (ideas) {
          const platformCounts: Record<string, number> = {}
          let totalCount = 0

          ideas.forEach((idea) => {
            if (idea.platforms) {
              idea.platforms.forEach((p: { platform: string }) => {
                platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1
                totalCount++
              })
            }
          })

          setTotal(totalCount)

          const platformStats: PlatformStat[] = [
            {
              name: 'Instagram',
              count: platformCounts.instagram || 0,
              icon: Instagram,
              color: 'bg-gradient-to-r from-purple-500 to-pink-500',
            },
            {
              name: 'TikTok',
              count: platformCounts.tiktok || 0,
              icon: () => (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              ),
              color: 'bg-gradient-to-r from-black to-gray-700',
            },
            {
              name: 'YouTube',
              count: platformCounts.youtube || 0,
              icon: Youtube,
              color: 'bg-gradient-to-r from-red-500 to-red-600',
            },
            {
              name: 'Facebook',
              count: platformCounts.facebook || 0,
              icon: Facebook,
              color: 'bg-gradient-to-r from-blue-600 to-blue-700',
            },
          ]

          setStats(platformStats)
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Conteúdo por Plataforma</h3>
      <div className="space-y-4">
        {stats.map((platform) => {
          const Icon = platform.icon
          const percentage = total > 0 ? (platform.count / total) * 100 : 0

          return (
            <div key={platform.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-700">{platform.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{platform.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${platform.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
