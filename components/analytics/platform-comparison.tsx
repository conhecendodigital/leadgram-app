'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook } from 'react-icons/fa'

interface PlatformComparisonProps {
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

// Calculate platform metrics from ideas
function calculatePlatformMetrics(ideas: any[]) {
  const platformData: Record<string, {
    totalEngagement: number
    totalViews: number
    postCount: number
  }> = {
    instagram: { totalEngagement: 0, totalViews: 0, postCount: 0 },
    tiktok: { totalEngagement: 0, totalViews: 0, postCount: 0 },
    youtube: { totalEngagement: 0, totalViews: 0, postCount: 0 },
    facebook: { totalEngagement: 0, totalViews: 0, postCount: 0 },
  }

  ideas.forEach((idea) => {
    if (idea.idea_platforms && Array.isArray(idea.idea_platforms)) {
      idea.idea_platforms.forEach((platform: any) => {
        const platformName = platform.platform?.toLowerCase()

        if (platformName && platformData[platformName] && platform.metrics && Array.isArray(platform.metrics) && platform.metrics.length > 0) {
          const latestMetric = platform.metrics[0]
          const engagement = (latestMetric.likes || 0) + (latestMetric.comments || 0) + (latestMetric.shares || 0)

          platformData[platformName].totalEngagement += engagement
          platformData[platformName].totalViews += latestMetric.views || 0
          platformData[platformName].postCount++
        }
      })
    }
  })

  return platformData
}

export default function PlatformComparison({ ideas = [] }: PlatformComparisonProps) {
  // Calculate real data from ideas
  const platformMetrics = calculatePlatformMetrics(ideas)

  // Check if we have real data
  const hasRealData = Object.values(platformMetrics).some(p => p.postCount > 0)

  // Use real data if available, otherwise use mock data
  const data = hasRealData
    ? [
        {
          month: 'Engajamento',
          instagram: platformMetrics.instagram.totalEngagement,
          tiktok: platformMetrics.tiktok.totalEngagement,
          youtube: platformMetrics.youtube.totalEngagement,
        },
      ]
    : [
        {
          month: 'Jan',
          instagram: 4000,
          tiktok: 2400,
          youtube: 1800,
        },
        {
          month: 'Fev',
          instagram: 3000,
          tiktok: 1398,
          youtube: 2200,
        },
        {
          month: 'Mar',
          instagram: 2000,
          tiktok: 9800,
          youtube: 2900,
        },
        {
          month: 'Abr',
          instagram: 2780,
          tiktok: 3908,
          youtube: 3200,
        },
        {
          month: 'Mai',
          instagram: 1890,
          tiktok: 4800,
          youtube: 3800,
        },
        {
          month: 'Jun',
          instagram: 2390,
          tiktok: 3800,
          youtube: 4300,
        },
      ]

  const platforms = [
    {
      name: 'Instagram',
      color: '#E4405F',
      icon: FaInstagram,
      followers: hasRealData
        ? `${platformMetrics.instagram.postCount} posts`
        : '127.5K'
    },
    {
      name: 'TikTok',
      color: '#000000',
      icon: FaTiktok,
      followers: hasRealData
        ? `${platformMetrics.tiktok.postCount} posts`
        : '89.2K'
    },
    {
      name: 'YouTube',
      color: '#FF0000',
      icon: FaYoutube,
      followers: hasRealData
        ? `${platformMetrics.youtube.postCount} posts`
        : '45.8K'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Comparação de Plataformas
          </h3>
          <p className="text-sm text-gray-600">
            Engajamento por plataforma nos últimos 6 meses
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${platform.color}15` }}
            >
              <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{platform.name}</p>
              <p className="text-xl font-bold text-gray-900">
                {platform.followers}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            <Legend />
            <Bar dataKey="instagram" fill="#E4405F" radius={[8, 8, 0, 0]} />
            <Bar dataKey="tiktok" fill="#000000" radius={[8, 8, 0, 0]} />
            <Bar dataKey="youtube" fill="#FF0000" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
