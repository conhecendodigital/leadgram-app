import { createServerClient } from '@/lib/supabase/server'
import AdminStatsCards from '@/components/admin/admin-stats-cards'
import RevenueChart from '@/components/admin/revenue-chart'
import RecentCustomers from '@/components/admin/recent-customers'
import PlanDistribution from '@/components/admin/plan-distribution'
import RecentActivity from '@/components/admin/recent-activity'
import { calculateMonthlyRevenue } from '@/lib/config/plans'

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()

  // Buscar estatísticas
  const { count: totalUsers } = await (supabase
    .from('profiles') as any)
    .select('*', { count: 'exact', head: true })

  const { data: subscriptions } = await (supabase
    .from('user_subscriptions') as any)
    .select('*, created_at')
    .order('created_at', { ascending: false })

  // Calcular estatísticas atuais
  const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active').length || 0
  const monthlyRevenue = calculateMonthlyRevenue(subscriptions || [])

  // Calcular mudanças percentuais (mês atual vs mês anterior)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Usuários do mês atual vs mês anterior
  const { count: currentMonthUsers } = await (supabase
    .from('profiles') as any)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())

  const { count: lastMonthUsers } = await (supabase
    .from('profiles') as any)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(lastMonthYear, lastMonth, 1).toISOString())
    .lt('created_at', new Date(currentYear, currentMonth, 1).toISOString())

  const userGrowth = lastMonthUsers && lastMonthUsers > 0
    ? ((((currentMonthUsers || 0) - lastMonthUsers) / lastMonthUsers) * 100).toFixed(1)
    : '0'

  // Assinaturas ativas do mês atual vs mês anterior
  const currentMonthSubs = subscriptions?.filter((s: any) => {
    const date = new Date(s.created_at)
    return s.status === 'active' &&
           date.getMonth() === currentMonth &&
           date.getFullYear() === currentYear
  }).length || 0

  const lastMonthSubs = subscriptions?.filter((s: any) => {
    const date = new Date(s.created_at)
    return s.status === 'active' &&
           date.getMonth() === lastMonth &&
           date.getFullYear() === lastMonthYear
  }).length || 0

  const subsGrowth = lastMonthSubs > 0
    ? (((currentMonthSubs - lastMonthSubs) / lastMonthSubs) * 100).toFixed(1)
    : '0'

  // Receita mês atual vs mês anterior
  const currentMonthRevenue = calculateMonthlyRevenue(
    subscriptions?.filter((s: any) => {
      const date = new Date(s.created_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }) || []
  )

  const lastMonthRevenue = calculateMonthlyRevenue(
    subscriptions?.filter((s: any) => {
      const date = new Date(s.created_at)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    }) || []
  )

  const revenueGrowth = lastMonthRevenue > 0
    ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : '0'

  // Taxa de conversão real (assinaturas pagas / total de usuários)
  const paidSubscriptions = subscriptions?.filter(
    (s: any) => s.status === 'active' && s.plan_type !== 'free'
  ).length || 0

  const conversionRate = totalUsers && totalUsers > 0
    ? ((paidSubscriptions / totalUsers) * 100).toFixed(1)
    : '0'

  // Mudança na taxa de conversão (comparar com mês anterior)
  const lastMonthPaidSubs = subscriptions?.filter((s: any) => {
    const date = new Date(s.created_at)
    return s.status === 'active' &&
           s.plan_type !== 'free' &&
           date.getMonth() === lastMonth &&
           date.getFullYear() === lastMonthYear
  }).length || 0

  const lastMonthConversionRate = lastMonthUsers && lastMonthUsers > 0
    ? (lastMonthPaidSubs / lastMonthUsers) * 100
    : 0

  const currentConversionRate = parseFloat(conversionRate)
  const conversionGrowth = lastMonthConversionRate > 0
    ? (((currentConversionRate - lastMonthConversionRate) / lastMonthConversionRate) * 100).toFixed(1)
    : '0'

  // Preparar dados de receita por mês para o gráfico (últimos 6 meses)
  const revenueByMonth = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentMonth - i, 1)
    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()

    const monthSubs = subscriptions?.filter((s: any) => {
      const date = new Date(s.created_at)
      return date.getMonth() === month &&
             date.getFullYear() === year &&
             s.status === 'active'
    }) || []

    revenueByMonth.push({
      month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }),
      revenue: calculateMonthlyRevenue(monthSubs)
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">
          Visão geral do sistema e clientes
        </p>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards
        totalUsers={totalUsers || 0}
        activeSubscriptions={activeSubscriptions}
        monthlyRevenue={monthlyRevenue}
        conversionRate={conversionRate}
        userGrowth={userGrowth}
        subsGrowth={subsGrowth}
        revenueGrowth={revenueGrowth}
        conversionGrowth={conversionGrowth}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueByMonth} />
        <PlanDistribution subscriptions={subscriptions || []} />
      </div>

      {/* Activity and Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <RecentCustomers />
      </div>
    </div>
  )
}
