import { createServerClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'

export default async function AdminReportsPage() {
  const supabase = await createServerClient()

  // Buscar dados para relatórios
  const { data: subscriptions } = await (supabase
    .from('user_subscriptions') as any)
    .select('*')
    .order('created_at', { ascending: false })

  const { data: payments } = await (supabase
    .from('payments') as any)
    .select('*')
    .order('created_at', { ascending: false })

  const { count: totalUsers } = await (supabase
    .from('profiles') as any)
    .select('*', { count: 'exact', head: true })

  // Calcular métricas
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const newUsersThisMonth = subscriptions?.filter((s: any) => {
    const date = new Date(s.created_at)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length || 0

  const revenueThisMonth = payments?.filter((p: any) => {
    const date = new Date(p.created_at)
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear &&
      (p.status === 'approved' || p.status === 'authorized')
    )
  }).reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0) || 0

  const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active').length || 0

  // Calcular dados dos últimos 6 meses
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - (5 - i), 1)
    return {
      month: date.toLocaleString('pt-BR', { month: 'short' }),
      year: date.getFullYear(),
      monthNum: date.getMonth(),
    }
  })

  const monthlyData = last6Months.map(({ month, year, monthNum }) => {
    const monthPayments = payments?.filter((p: any) => {
      const date = new Date(p.created_at)
      return (
        date.getMonth() === monthNum &&
        date.getFullYear() === year &&
        (p.status === 'approved' || p.status === 'authorized')
      )
    }) || []

    const revenue = monthPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0)

    const newUsers = subscriptions?.filter((s: any) => {
      const date = new Date(s.created_at)
      return date.getMonth() === monthNum && date.getFullYear() === year
    }).length || 0

    return {
      month,
      revenue,
      newUsers,
      transactions: monthPayments.length,
    }
  })

  // Distribuição por plano
  const planDistribution = [
    {
      plan: 'Free',
      count: subscriptions?.filter((s: any) => s.plan_type === 'free').length || 0,
      color: 'bg-gray-500',
    },
    {
      plan: 'Pro',
      count: subscriptions?.filter((s: any) => s.plan_type === 'pro').length || 0,
      color: 'bg-primary',
    },
    {
      plan: 'Premium',
      count: subscriptions?.filter((s: any) => s.plan_type === 'premium').length || 0,
      color: 'bg-primary',
    },
  ]

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Relatórios
        </h1>
        <p className="text-gray-600">
          Análise e insights do negócio
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Total de Usuários
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {totalUsers || 0}
          </p>
          <p className="text-xs text-green-600">
            +{newUsersThisMonth} este mês
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Receita Mensal
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            R$ {revenueThisMonth.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            Mês atual
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Assinaturas Ativas
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {activeSubscriptions}
          </p>
          <p className="text-xs text-gray-500">
            De {subscriptions?.length || 0} totais
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            MRR
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            R$ {revenueThisMonth.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            Monthly Recurring Revenue
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Receita Mensal
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {data.month}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    R$ {data.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Users Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Novos Usuários
            </h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const maxUsers = Math.max(...monthlyData.map(d => d.newUsers), 1)
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {data.month}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {data.newUsers} usuários
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(data.newUsers / maxUsers) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Distribuição por Plano
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planDistribution.map((plan) => {
            const percentage = subscriptions?.length ? (plan.count / subscriptions.length) * 100 : 0
            return (
              <div key={plan.plan} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
                      className={plan.color}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {plan.plan}
                </h3>
                <p className="text-sm text-gray-500">
                  {plan.count} usuários
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
