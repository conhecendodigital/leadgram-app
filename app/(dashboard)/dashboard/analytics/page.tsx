import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, Instagram, Lock, Zap, TrendingUp, PieChart, Calendar } from 'lucide-react'
import InstagramAnalyticsClient from '@/components/analytics/instagram-analytics-client'
import { getUserRole } from '@/lib/roles'
import Link from 'next/link'

// Forçar renderização dinâmica para sempre buscar dados atualizados
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verificar plano do usuário
  const userRole = await getUserRole(user.id)
  const isAdmin = userRole === 'admin'

  const { data: subscription } = await (supabase
    .from('user_subscriptions') as any)
    .select('plan_type')
    .eq('user_id', user.id)
    .single()

  const planType = isAdmin ? 'admin' : (subscription?.plan_type || 'free')

  // Bloquear acesso para usuários do plano Free
  if (planType === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Analytics Premium
          </h2>
          <p className="text-gray-600 mb-8">
            Desbloqueie métricas avançadas, gráficos de evolução e insights detalhados
            do seu Instagram com o plano Pro ou Premium.
          </p>

          {/* Features do Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Gráficos de Evolução</h4>
                <p className="text-sm text-gray-500">Acompanhe curtidas, alcance e engajamento</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Métricas Detalhadas</h4>
                <p className="text-sm text-gray-500">Impressões, alcance e taxa de engajamento</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Melhores Horários</h4>
                <p className="text-sm text-gray-500">Descubra quando postar para mais engajamento</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Análise de Posts</h4>
                <p className="text-sm text-gray-500">Veja o desempenho de cada publicação</p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/settings?tab=plan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            <Zap className="w-5 h-5" />
            Fazer Upgrade para Pro
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            A partir de R$ 29,90/mês
          </p>
        </div>
      </div>
    )
  }

  // Verificar se tem Instagram conectado
  const { data: accountData } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!accountData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl mb-6">
            <Instagram className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Instagram não conectado
          </h2>
          <p className="text-gray-600 mb-6">
            Conecte sua conta Instagram Business para visualizar analytics detalhados
          </p>
          <a
            href="/dashboard/instagram"
            className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-5 h-5" />
            Conectar Instagram
          </a>
        </div>
      </div>
    )
  }

  // Type narrowing - accountData is not null here
  const account = accountData as {
    id: string
    username: string
    followers_count: number
    follows_count: number
    media_count: number
    [key: string]: any
  }

  // Buscar histórico de insights (últimos 30 dias)
  const { data: insights } = await supabase
    .from('instagram_insights')
    .select('*')
    .eq('instagram_account_id', account.id)
    .order('date', { ascending: false })
    .limit(30)

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Analytics
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            @{account.username} • Métricas em tempo real
          </p>
        </div>
      </div>

      {/* Client Component com dados dinâmicos */}
      <InstagramAnalyticsClient
        account={account}
        historicalData={insights || []}
        planType={planType}
      />
    </div>
  )
}
