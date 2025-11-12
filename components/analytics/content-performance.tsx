'use client'

import { motion } from 'framer-motion'
import { Eye, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react'
import Image from 'next/image'

interface ContentPerformanceProps {
  ideas?: any[]
}

// Helper to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Calculate performance metrics for each idea
function calculateTopContent(ideas: any[]) {
  const ideasWithMetrics = ideas
    .map((idea) => {
      let totalViews = 0
      let totalLikes = 0
      let totalComments = 0
      let totalShares = 0

      if (idea.idea_platforms && Array.isArray(idea.idea_platforms)) {
        idea.idea_platforms.forEach((platform: any) => {
          if (platform.metrics && Array.isArray(platform.metrics) && platform.metrics.length > 0) {
            const latestMetric = platform.metrics[0]
            totalViews += latestMetric.views || 0
            totalLikes += latestMetric.likes || 0
            totalComments += latestMetric.comments || 0
            totalShares += latestMetric.shares || 0
          }
        })
      }

      // Calculate performance score: views + (likes * 2) + (comments * 3)
      const performanceScore = totalViews + (totalLikes * 2) + (totalComments * 3)

      // Calculate engagement rate
      const engagementRate = totalViews > 0
        ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1)
        : '0.0'

      return {
        id: idea.id,
        title: idea.title,
        thumbnail: idea.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        views: formatNumber(totalViews),
        viewsRaw: totalViews,
        likes: formatNumber(totalLikes),
        comments: formatNumber(totalComments),
        shares: formatNumber(totalShares),
        engagement: `${engagementRate}%`,
        performanceScore,
        trend: 'up' as const,
      }
    })
    .filter((idea) => idea.viewsRaw > 0) // Only ideas with views
    .sort((a, b) => b.performanceScore - a.performanceScore) // Sort by performance
    .slice(0, 3) // Top 3

  return ideasWithMetrics
}

export default function ContentPerformance({ ideas = [] }: ContentPerformanceProps) {
  const topContentReal = calculateTopContent(ideas)

  // Use real data if available, otherwise use mock data
  const topContent = topContentReal.length > 0
    ? topContentReal
    : [
        {
          id: 1,
          title: '10 Dicas para Aumentar Engajamento',
          thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
          views: '45.2K',
          likes: '3.8K',
          comments: '234',
          shares: '156',
          engagement: '8.9%',
          trend: 'up' as const,
        },
        {
          id: 2,
          title: 'Como Criar Conteúdo Viral',
          thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
          views: '38.5K',
          likes: '3.2K',
          comments: '189',
          shares: '142',
          engagement: '8.5%',
          trend: 'up' as const,
        },
        {
          id: 3,
          title: 'Estratégias de Marketing Digital',
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          views: '32.1K',
          likes: '2.9K',
          comments: '167',
          shares: '98',
          engagement: '7.8%',
          trend: 'up' as const,
        },
      ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Conteúdo de Melhor Performance
          </h3>
          <p className="text-sm text-gray-600">
            Top 3 posts dos últimos 30 dias
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {topContent.map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={content.thumbnail}
                alt={content.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                <p className="text-xs text-white font-medium">#{index + 1}</p>
              </div>
            </div>

            {/* Content Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  {content.title}
                </h4>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {content.engagement}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {content.views}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-900">
                    {content.likes}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-900">
                    {content.comments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-900">
                    {content.shares}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
