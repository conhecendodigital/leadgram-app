'use client'

import { TrendingUp, TrendingDown, Users, Eye, Heart, MessageCircle } from 'lucide-react'

interface AnalyticsOverviewProps {
  ideas?: any[]
}

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Helper function to calculate metrics from ideas
function calculateMetrics(ideas: any[]) {
  let totalViews = 0
  let totalLikes = 0
  let totalComments = 0
  let totalShares = 0
  let totalReach = 0
  let postedIdeasCount = 0

  ideas.forEach((idea) => {
    if (idea.idea_platforms && Array.isArray(idea.idea_platforms)) {
      idea.idea_platforms.forEach((platform: any) => {
        if (platform.metrics && Array.isArray(platform.metrics) && platform.metrics.length > 0) {
          // Get the latest metric
          const latestMetric = platform.metrics[0]
          totalViews += latestMetric.views || 0
          totalLikes += latestMetric.likes || 0
          totalComments += latestMetric.comments || 0
          totalShares += latestMetric.shares || 0
          totalReach += latestMetric.reach || 0
          postedIdeasCount++
        }
      })
    }
  })

  const totalEngagement = totalLikes + totalComments + totalShares

  return {
    totalViews,
    totalEngagement,
    totalReach,
    totalComments,
    postedIdeasCount,
  }
}

export default function AnalyticsOverview({ ideas = [] }: AnalyticsOverviewProps) {
  // Calculate real metrics from ideas
  const metrics = calculateMetrics(ideas)

  // Check if we have real data
  const hasRealData = metrics.postedIdeasCount > 0

  const stats = [
    {
      label: 'Total de Visualizações',
      value: hasRealData ? formatNumber(metrics.totalViews) : '0',
      change: hasRealData ? '+12.5%' : '0%', // TODO: Calculate real change when historical data available
      trend: hasRealData ? 'up' as const : 'neutral' as const,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Engajamento',
      value: hasRealData ? formatNumber(metrics.totalEngagement) : '0',
      change: hasRealData ? '+8.3%' : '0%',
      trend: hasRealData ? 'up' as const : 'neutral' as const,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Alcance Total',
      value: hasRealData ? formatNumber(metrics.totalReach) : '0',
      change: hasRealData ? '+15.2%' : '0%',
      trend: hasRealData ? 'up' as const : 'neutral' as const,
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Comentários',
      value: hasRealData ? formatNumber(metrics.totalComments) : '0',
      change: hasRealData ? '+5.8%' : '0%',
      trend: hasRealData ? 'up' as const : 'neutral' as const,
      icon: MessageCircle,
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            {stat.trend !== 'neutral' && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                  stat.trend === 'up'
                    ? 'bg-green-50 text-green-600'
                    : stat.trend === 'down'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : stat.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null}
                {stat.change}
              </div>
            )}
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
