'use client'

import { useState, useEffect, useMemo } from 'react'
import { m } from 'framer-motion'
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, AlertCircle } from 'lucide-react'
import { PLAN_CONFIG } from '@/lib/config/plans'

interface ReportsDashboardProps {
  initialData: {
    subscriptions: any[]
    payments: any[]
    totalUsers: number
  }
}

export default function ReportsDashboard({ initialData }: ReportsDashboardProps) {
  const [period, setPeriod] = useState<'3m' | '6m' | '1y'>('6m')
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const { subscriptions, payments, totalUsers } = initialData

  // Calcular número de meses baseado no período
  const monthsToShow = period === '3m' ? 3 : period === '6m' ? 6 : 12

  // Calcular métricas
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const newUsersThisMonth = useMemo(() => {
    return subscriptions?.filter((s: any) => {
      const date = new Date(s.created_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length || 0
  }, [subscriptions, currentMonth, currentYear])

  const revenueThisMonth = useMemo(() => {
    return payments?.filter((p: any) => {
      const date = new Date(p.created_at)
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        (p.status === 'approved' || p.status === 'authorized')
      )
    }).reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0) || 0
  }, [payments, currentMonth, currentYear])

  const activeSubscriptions = useMemo(() => {
    return subscriptions?.filter((s: any) => s.status === 'active').length || 0
  }, [subscriptions])

  // Calcular MRR real (Monthly Recurring Revenue)
  const mrr = useMemo(() => {
    const activeByPlan = {
      pro: subscriptions?.filter((s: any) => s.status === 'active' && s.plan_type === 'pro').length || 0,
      premium: subscriptions?.filter((s: any) => s.status === 'active' && s.plan_type === 'premium').length || 0,
    }

    return (
      activeByPlan.pro * PLAN_CONFIG.pro.monthlyPrice +
      activeByPlan.premium * PLAN_CONFIG.premium.monthlyPrice
    )
  }, [subscriptions])

  // Calcular dados dos últimos N meses
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: monthsToShow }, (_, i) => {
      const date = new Date(currentYear, currentMonth - (monthsToShow - 1 - i), 1)
      return {
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        year: date.getFullYear(),
        monthNum: date.getMonth(),
      }
    })

    return months.map(({ month, year, monthNum }) => {
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
  }, [payments, subscriptions, monthsToShow, currentYear, currentMonth])

  // Distribuição por plano usando cores do PLAN_CONFIG
  const planDistribution = useMemo(() => {
    return [
      {
        plan: 'Free',
        count: subscriptions?.filter((s: any) => s.plan_type === 'free').length || 0,
        bgColor: 'bg-gray-500',
        color: '#6b7280'
      },
      {
        plan: 'Pro',
        count: subscriptions?.filter((s: any) => s.plan_type === 'pro').length || 0,
        bgColor: 'bg-gradient-to-r from-red-600 to-orange-600',
        color: '#dc2626'
      },
      {
        plan: 'Premium',
        count: subscriptions?.filter((s: any) => s.plan_type === 'premium').length || 0,
        bgColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
        color: '#9333ea'
      },
    ]
  }, [subscriptions])

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)
  const maxUsers = Math.max(...monthlyData.map(d => d.newUsers), 1)

  // Função de exportação
  const handleExport = () => {
    setIsExporting(true)
    try {
      const csvData = [
        ['Mês', 'Receita', 'Novos Usuários', 'Transações'],
        ...monthlyData.map(d => [d.month, d.revenue.toFixed(2), d.newUsers, d.transactions])
      ]

      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${period}-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Erro ao exportar relatório')
    } finally {
      setIsExporting(false)
    }
  }

  const stats = [
    {
      icon: Users,
      label: 'Total de Usuários',
      value: totalUsers || 0,
      subtitle: `+${newUsersThisMonth} este mês`,
      gradient: 'gradient-primary',
      delay: 0.1
    },
    {
      icon: DollarSign,
      label: 'Receita Mensal',
      value: `R$ ${revenueThisMonth.toFixed(2)}`,
      subtitle: 'Mês atual',
      gradient: 'from-green-500 to-green-600',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      label: 'Assinaturas Ativas',
      value: activeSubscriptions,
      subtitle: `De ${subscriptions?.length || 0} totais`,
      gradient: 'gradient-primary',
      delay: 0.3
    },
    {
      icon: Calendar,
      label: 'MRR',
      value: `R$ ${mrr.toFixed(2)}`,
      subtitle: 'Monthly Recurring Revenue',
      gradient: 'from-orange-500 to-orange-600',
      delay: 0.4
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header with Period Filter */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Relatórios
          </h1>
          <p className="text-gray-600">
            Análise e insights do negócio
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as '3m' | '6m' | '1y')}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último ano</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </m.div>

      {/* Error Banner */}
      {error && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 hover:text-red-900 font-medium"
            >
              Fechar
            </button>
          </div>
        </m.div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="bg-white rounded-2xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-green-600">
                {stat.subtitle}
              </p>
            </m.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
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
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </m.div>

        {/* New Users Chart */}
        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Novos Usuários
            </h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {data.month}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.newUsers} usuários
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.newUsers / maxUsers) * 100}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                    className="bg-primary h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>

      {/* Plan Distribution */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Distribuição por Plano
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planDistribution.map((plan, index) => {
            const percentage = subscriptions?.length ? (plan.count / subscriptions.length) * 100 : 0
            const circumference = 2 * Math.PI * 56
            const strokeDashoffset = circumference - (percentage / 100) * circumference

            return (
              <m.div
                key={plan.plan}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
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
                    <m.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={plan.color}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 1 }}
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
              </m.div>
            )
          })}
        </div>
      </m.div>
    </div>
  )
}
