'use client'

import { useState, useMemo } from 'react'
import QuickFilters, { StatusFilterType, PeriodFilterType } from './quick-filters'
import StatsOverview from './stats-overview'
import ContentGrid from './content-grid'
import PerformanceChart from './performance-chart'
import StoriesCarousel from './stories-carousel'
import ActivityFeed from './activity-feed'
import TopContent from './top-content'
import PlatformComparison from './platform-comparison'
import GoalsCards from './goals-cards'
import ScheduledPosts from './scheduled-posts'
import InsightsWidget from './insights-widget'
import OnboardingTour from './onboarding-tour'

interface DashboardClientWrapperProps {
  ideas: any[]
  stats: {
    totalIdeas: number
    totalViews: number
    totalLikes: number
    totalComments: number
    engagementRate: string
    viewsGrowth: number
    likesGrowth: number
    commentsGrowth: number
    engagementGrowth: number
    ideasGrowth: number
  }
}

export default function DashboardClientWrapper({
  ideas,
  stats,
}: DashboardClientWrapperProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>('all')

  // Filtrar ideias baseado nos filtros selecionados
  const filteredIdeas = useMemo(() => {
    let filtered = ideas

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(idea => idea.status === statusFilter)
    }

    // Filtro de período
    if (periodFilter !== 'all') {
      const daysAgo = parseInt(periodFilter)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

      filtered = filtered.filter(idea => {
        const ideaDate = new Date(idea.created_at)
        return ideaDate >= cutoffDate
      })
    }

    return filtered
  }, [ideas, statusFilter, periodFilter])

  const postedIdeas = filteredIdeas.filter((i: any) => i.status === 'posted')

  return (
    <>
      {/* Quick Filters */}
      <QuickFilters
        statusFilter={statusFilter}
        periodFilter={periodFilter}
        onStatusChange={setStatusFilter}
        onPeriodChange={setPeriodFilter}
      />

      {/* Stats Overview */}
      <StatsOverview {...stats} />

      {/* Stories Carousel */}
      <StoriesCarousel ideas={filteredIdeas.slice(0, 10)} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <PerformanceChart ideas={filteredIdeas} />
          <PlatformComparison ideas={filteredIdeas} />
          <InsightsWidget ideas={filteredIdeas} stats={stats} />
          <ContentGrid ideas={postedIdeas.slice(0, 9)} />
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-4 md:space-y-6">
          <TopContent ideas={postedIdeas.slice(0, 5)} />
          <GoalsCards ideas={filteredIdeas} stats={stats} />
          <ScheduledPosts ideas={filteredIdeas} />
          <ActivityFeed ideas={filteredIdeas.slice(0, 5)} />
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </>
  )
}
