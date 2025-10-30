import StatsCards from '@/components/dashboard/stats-cards'
import FunnelChart from '@/components/dashboard/funnel-chart'
import PlatformStats from '@/components/dashboard/platform-stats'
import RecentIdeas from '@/components/dashboard/recent-ideas'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Cards */}
        <StatsCards />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart />
          <PlatformStats />
        </div>

        {/* Recent Ideas */}
        <RecentIdeas />
      </div>
    </div>
  )
}
