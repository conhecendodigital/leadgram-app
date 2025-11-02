import { createServerClient } from '@/lib/supabase/server'
import AdminStatsCards from '@/components/admin/admin-stats-cards'
import RevenueChart from '@/components/admin/revenue-chart'
import RecentCustomers from '@/components/admin/recent-customers'
import PlanDistribution from '@/components/admin/plan-distribution'

export default async function AdminDashboardPage() {
  const supabase = createServerClient()

  // Buscar estatísticas
  const { count: totalUsers } = await (supabase
    .from('profiles') as any)
    .select('*', { count: 'exact', head: true })

  const { data: subscriptions } = await (supabase
    .from('user_subscriptions') as any)
    .select('*')

  const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active').length || 0

  // Calcular receita (simplificado)
  const monthlyRevenue = subscriptions?.reduce((sum: number, sub: any) => {
    if (sub.status === 'active') {
      if (sub.plan_type === 'pro') return sum + 49
      if (sub.plan_type === 'premium') return sum + 99
    }
    return sum
  }, 0) || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral do sistema e clientes
        </p>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards
        totalUsers={totalUsers || 0}
        activeSubscriptions={activeSubscriptions}
        monthlyRevenue={monthlyRevenue}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <PlanDistribution subscriptions={subscriptions || []} />
      </div>

      {/* Recent Customers */}
      <RecentCustomers />
    </div>
  )
}
