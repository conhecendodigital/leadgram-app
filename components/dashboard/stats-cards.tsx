'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lightbulb, Video, CheckCircle2 } from 'lucide-react'

interface Stats {
  total: number
  recorded: number
  posted: number
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({ total: 0, recorded: 0, posted: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Buscar todas as ideias
        const { data: ideas } = await supabase
          .from('ideas')
          .select('status')
          .eq('user_id', user.id)

        if (ideas) {
          setStats({
            total: ideas.length,
            recorded: ideas.filter(i => i.status === 'recorded').length,
            posted: ideas.filter(i => i.status === 'posted').length,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Total de Ideias',
      value: stats.total,
      icon: Lightbulb,
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Vídeos Gravados',
      value: stats.recorded,
      icon: Video,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conteúdos Postados',
      value: stats.posted,
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-full w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6"
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
