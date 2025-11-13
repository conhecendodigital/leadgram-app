'use client'

import { m } from 'framer-motion'
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Video } from 'lucide-react'
import { useMemo } from 'react'

interface PlatformComparisonProps {
  ideas: any[]
}

type PlatformData = {
  platform: string
  icon: string
  color: string
  gradient: string
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  avgEngagement: number
}

export default function PlatformComparison({ ideas }: PlatformComparisonProps) {
  // Agregar métricas por plataforma
  const platformData = useMemo(() => {
    const platforms: Record<string, PlatformData> = {}

    ideas
      .filter(idea => idea.status === 'posted')
      .forEach(idea => {
        idea.idea_platforms?.forEach((platform: any) => {
          const platformName = platform.platform

          if (!platforms[platformName]) {
            const config = getPlatformConfig(platformName)
            platforms[platformName] = {
              platform: platformName,
              icon: config.icon,
              color: config.color,
              gradient: config.gradient,
              totalPosts: 0,
              totalViews: 0,
              totalLikes: 0,
              totalComments: 0,
              avgEngagement: 0,
            }
          }

          // Incrementar totais
          platforms[platformName].totalPosts += 1

          // Pegar última métrica
          const latestMetric = platform.metrics?.[0]
          if (latestMetric) {
            platforms[platformName].totalViews += latestMetric.views || 0
            platforms[platformName].totalLikes += latestMetric.likes || 0
            platforms[platformName].totalComments += latestMetric.comments || 0
          }
        })
      })

    // Calcular engajamento médio para cada plataforma
    Object.values(platforms).forEach(p => {
      if (p.totalViews > 0) {
        p.avgEngagement = ((p.totalLikes + p.totalComments) / p.totalViews) * 100
      }
    })

    return Object.values(platforms).sort((a, b) => b.totalViews - a.totalViews)
  }, [ideas])

  // Função auxiliar para configuração de plataforma
  function getPlatformConfig(platform: string) {
    const configs: Record<string, { icon: string; color: string; gradient: string }> = {
      instagram: {
        icon: '📸',
        color: 'text-pink-600',
        gradient: 'from-pink-500 to-purple-500',
      },
      tiktok: {
        icon: '🎵',
        color: 'text-black',
        gradient: 'from-gray-900 to-gray-700',
      },
      youtube: {
        icon: '📺',
        color: 'text-red-600',
        gradient: 'from-red-500 to-red-600',
      },
      twitter: {
        icon: '🐦',
        color: 'text-blue-500',
        gradient: 'from-blue-400 to-blue-600',
      },
      linkedin: {
        icon: '💼',
        color: 'text-blue-700',
        gradient: 'from-blue-600 to-blue-800',
      },
    }

    return (
      configs[platform.toLowerCase()] || {
        icon: '🌐',
        color: 'text-gray-600',
        gradient: 'from-gray-500 to-gray-600',
      }
    )
  }

  // Se não há plataformas, mostrar mensagem
  if (platformData.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
      >
        <div className="text-center text-gray-500">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma plataforma com dados</p>
          <p className="text-sm mt-2">Poste conteúdos em diferentes plataformas para ver a comparação</p>
        </div>
      </m.div>
    )
  }

  // Encontrar melhor plataforma por engajamento
  const bestPlatform = platformData.reduce((best, current) =>
    current.avgEngagement > best.avgEngagement ? current : best
  )

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow"
      data-tour="platform-comparison"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            Comparação de Plataformas
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>{platformData.length} {platformData.length === 1 ? 'plataforma' : 'plataformas'}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Compare o desempenho do seu conteúdo em cada plataforma
        </p>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platformData.map((platform, index) => {
          const isBest = platform.platform === bestPlatform.platform

          return (
            <m.div
              key={platform.platform}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                isBest
                  ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              {/* Best Platform Badge */}
              {isBest && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Melhor
                </div>
              )}

              {/* Platform Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${platform.gradient} shadow-lg`}>
                  {platform.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 capitalize text-lg">
                    {platform.platform}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {platform.totalPosts} {platform.totalPosts === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Views */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">Visualizações</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {platform.totalViews.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Likes */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-medium text-gray-600">Curtidas</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {platform.totalLikes.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Comments */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-600">Comentários</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {platform.totalComments.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Engagement */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">Engajamento</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {platform.avgEngagement.toFixed(1)}%
                  </p>
                </div>
              </div>
            </m.div>
          )
        })}
      </div>

      {/* Insights */}
      {platformData.length > 1 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 Insight:</span> Sua melhor plataforma é{' '}
            <span className="font-bold capitalize">{bestPlatform.platform}</span> com{' '}
            <span className="font-bold">{bestPlatform.avgEngagement.toFixed(1)}%</span> de taxa de engajamento.
            {bestPlatform.totalViews > 0 && (
              <> Total de <span className="font-bold">{bestPlatform.totalViews.toLocaleString('pt-BR')}</span> visualizações!</>
            )}
          </p>
        </div>
      )}
    </m.div>
  )
}
