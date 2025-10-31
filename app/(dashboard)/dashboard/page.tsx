import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsCards from '@/components/dashboard/stats-cards'
import FunnelChart from '@/components/dashboard/funnel-chart'
import PlatformStats from '@/components/dashboard/platform-stats'
import RecentIdeas from '@/components/dashboard/recent-ideas'
import QuickActions from '@/components/dashboard/quick-actions'
import ActivityFeed from '@/components/dashboard/activity-feed'
import { Sparkles } from 'lucide-react'
import type { Database } from '@/types/database.types'

type IdeaWithRelations = Database['public']['Tables']['ideas']['Row'] & {
  idea_platforms?: Array<Database['public']['Tables']['idea_platforms']['Row'] & {
    metrics?: Array<any>
  }>
}

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('ideas')
    .select('*, idea_platforms(*, metrics(*))')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
  
  const ideas = data as IdeaWithRelations[] | null

  const totalIdeas = ideas?.length || 0
  const recordedIdeas = ideas?.filter((i) => i.status === 'recorded').length || 0
  const postedIdeas = ideas?.filter((i) => i.status === 'posted').length || 0

  return (
    <div className="p-8 space-y-6">
      {/* Stats Cards */}
      <StatsCards
        totalIdeas={totalIdeas}
        recordedIdeas={recordedIdeas}
        postedIdeas={postedIdeas}
      />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart />
        <PlatformStats />
      </div>

      {/* Quick Actions Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-6 w-6" />
            <h3 className="text-2xl font-bold">Ações Rápidas</h3>
          </div>
          <p className="text-white/90 mb-6 max-w-2xl">
            Acelere seu workflow com atalhos inteligentes
          </p>
          <QuickActions />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentIdeas />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
