import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsOverview from '@/components/dashboard/stats-overview'
import ContentGrid from '@/components/dashboard/content-grid'
import PerformanceChart from '@/components/dashboard/performance-chart'
import QuickActions from '@/components/dashboard/quick-actions'
import StoriesCarousel from '@/components/dashboard/stories-carousel'
import ActivityFeed from '@/components/dashboard/activity-feed'
import TopContent from '@/components/dashboard/top-content'
import type { Database } from '@/types/database.types'

type IdeaWithRelations = Database['public']['Tables']['ideas']['Row'] & {
  idea_platforms?: Array<
    Database['public']['Tables']['idea_platforms']['Row'] & {
      metrics?: Array<any>
    }
  >
}

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Buscar perfil
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null

  // Buscar ideias com métricas
  const { data } = await supabase
    .from('ideas')
    .select('*, idea_platforms(*, metrics(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const ideas = data as IdeaWithRelations[] | null

  // Datas para comparação
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  // Filtrar ideias por período
  const postedIdeas = ideas?.filter((i) => i.status === 'posted') || []
  const currentPeriodIdeas = postedIdeas.filter(i => new Date(i.created_at) >= thirtyDaysAgo)
  const previousPeriodIdeas = postedIdeas.filter(i => {
    const date = new Date(i.created_at)
    return date >= sixtyDaysAgo && date < thirtyDaysAgo
  })

  // Função auxiliar para calcular métricas
  const calculateMetrics = (ideasList: typeof postedIdeas) => {
    const views = ideasList.reduce((sum, idea) => {
      const v = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
        const latestMetric = platform.metrics?.[0]
        return pSum + (latestMetric?.views || 0)
      }, 0) || 0
      return sum + v
    }, 0)

    const likes = ideasList.reduce((sum, idea) => {
      const l = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
        const latestMetric = platform.metrics?.[0]
        return pSum + (latestMetric?.likes || 0)
      }, 0) || 0
      return sum + l
    }, 0)

    const comments = ideasList.reduce((sum, idea) => {
      const c = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
        const latestMetric = platform.metrics?.[0]
        return pSum + (latestMetric?.comments || 0)
      }, 0) || 0
      return sum + c
    }, 0)

    const engagement = views > 0 ? ((likes + comments) / views * 100) : 0

    return { views, likes, comments, engagement, count: ideasList.length }
  }

  // Métricas do período atual (últimos 30 dias)
  const currentMetrics = calculateMetrics(currentPeriodIdeas)

  // Métricas do período anterior (30-60 dias atrás)
  const previousMetrics = calculateMetrics(previousPeriodIdeas)

  // Função para calcular % de crescimento
  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Calcular crescimentos
  const viewsGrowth = calculateGrowth(currentMetrics.views, previousMetrics.views)
  const likesGrowth = calculateGrowth(currentMetrics.likes, previousMetrics.likes)
  const commentsGrowth = calculateGrowth(currentMetrics.comments, previousMetrics.comments)
  const engagementGrowth = calculateGrowth(currentMetrics.engagement, previousMetrics.engagement)
  const ideasGrowth = calculateGrowth(currentMetrics.count, previousMetrics.count)

  // Totais (de todos os posts, não só dos últimos 30 dias)
  const totalIdeas = ideas?.length || 0
  const totalViews = postedIdeas.reduce((sum, idea) => {
    const views = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
      const latestMetric = platform.metrics?.[0]
      return pSum + (latestMetric?.views || 0)
    }, 0) || 0
    return sum + views
  }, 0)

  const totalLikes = postedIdeas.reduce((sum, idea) => {
    const likes = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
      const latestMetric = platform.metrics?.[0]
      return pSum + (latestMetric?.likes || 0)
    }, 0) || 0
    return sum + likes
  }, 0)

  const totalComments = postedIdeas.reduce((sum, idea) => {
    const comments = idea.idea_platforms?.reduce((pSum: number, platform: any) => {
      const latestMetric = platform.metrics?.[0]
      return pSum + (latestMetric?.comments || 0)
    }, 0) || 0
    return sum + comments
  }, 0)

  const engagementRate = totalViews > 0
    ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2)
    : '0.00'

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header Premium */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Olá, {profile?.full_name || 'Criador'}! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Acompanhe seu desempenho e gerencie seu conteúdo
            </p>
          </div>
          <QuickActions />
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview
        totalIdeas={totalIdeas}
        totalViews={totalViews}
        totalLikes={totalLikes}
        totalComments={totalComments}
        engagementRate={engagementRate}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        engagementGrowth={engagementGrowth}
        ideasGrowth={ideasGrowth}
      />

      {/* Stories Carousel - Suas Ideias em Progresso */}
      <StoriesCarousel ideas={ideas?.slice(0, 10) || []} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <PerformanceChart ideas={ideas || []} />
          <ContentGrid ideas={postedIdeas.slice(0, 9)} />
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-4 md:space-y-6">
          <TopContent ideas={postedIdeas.slice(0, 5)} />
          <ActivityFeed ideas={ideas?.slice(0, 5) || []} />
        </div>
      </div>
    </div>
  )
}
