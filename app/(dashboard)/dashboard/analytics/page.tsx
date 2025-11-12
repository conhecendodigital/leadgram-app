import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, Instagram } from 'lucide-react'
import InstagramAnalyticsClient from '@/components/analytics/instagram-analytics-client'

export default async function AnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
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
      <div className="min-h-screen flex items-center justify-center p-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics
            </h1>
          </div>
          <p className="text-gray-600">
            @{account.username} • Métricas em tempo real
          </p>
        </div>
      </div>

      {/* Client Component com dados dinâmicos */}
      <InstagramAnalyticsClient
        account={account}
        historicalData={insights || []}
      />
    </div>
  )
}
