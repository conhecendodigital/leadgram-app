import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const AnalyticsOverview = dynamic(() => import('@/components/analytics/analytics-overview'), {
  loading: () => <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />,
})

const PlatformComparison = dynamic(() => import('@/components/analytics/platform-comparison'), {
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />,
})

const ContentPerformance = dynamic(() => import('@/components/analytics/content-performance'), {
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />,
})

const AudienceInsights = dynamic(() => import('@/components/analytics/audience-insights'), {
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />,
})

const GrowthMetrics = dynamic(() => import('@/components/analytics/growth-metrics'), {
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />,
})

export default async function AnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Buscar dados para analytics com tratamento de erro
  let ideas = []

  try {
    const { data, error } = await (supabase
      .from('ideas') as any)
      .select('*, idea_platforms(*, metrics(*))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      ideas = data
    }
  } catch (error) {
    console.error('Error fetching ideas:', error)
    // Continua com array vazio se houver erro
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Analytics
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Insights profundos sobre seu desempenho
        </p>
      </div>

      {/* Analytics Overview Cards */}
      <AnalyticsOverview ideas={ideas} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Platform Comparison */}
        <PlatformComparison ideas={ideas} />

        {/* Growth Metrics */}
        <GrowthMetrics ideas={ideas} />
      </div>

      {/* Content Performance */}
      <ContentPerformance ideas={ideas} />

      {/* Audience Insights */}
      <AudienceInsights ideas={ideas} />
    </div>
  )
}
