'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp, Users, Eye, Heart, MessageCircle, Award, Calendar, Clock } from 'lucide-react'
import { showToast } from '@/lib/toast'
import {
  calculateEngagementRate,
  calculateGrowthPercentage,
  findBestTimeToPost,
  findBestDaysToPost,
  formatNumber,
  formatPercentage,
} from '@/lib/analytics/metrics'

interface InstagramAnalyticsClientProps {
  account: {
    id: string
    username: string
    followers_count: number
    follows_count: number
    media_count: number
  }
  historicalData: any[]
}

export default function InstagramAnalyticsClient({
  account,
  historicalData,
}: InstagramAnalyticsClientProps) {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<any>(null)

  // Buscar insights ao carregar
  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    setLoading(true)
    const loadingToast = showToast.loading('Buscando métricas do Instagram...')

    try {
      const response = await fetch('/api/instagram/insights')
      const data = await response.json()

      if (!response.ok) {
        // Log detalhado do erro
        console.error('Erro detalhado da API:', data)

        const errorMessage = data.details
          ? `${data.error}: ${data.details}`
          : data.error || 'Erro ao buscar insights'

        throw new Error(errorMessage)
      }

      setInsights(data)
      showToast.success('✅ Métricas atualizadas!', { id: loadingToast })
    } catch (error: any) {
      console.error('Error fetching insights:', error)
      showToast.error(`❌ ${error.message}`, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  const { summary, daily_data, top_posts } = insights

  // Calcular métricas adicionais
  // Impressões vêm dos posts individuais, não dos dados diários
  const avgDailyImpressions = summary.total_impressions && daily_data.length > 0
    ? summary.total_impressions / daily_data.length
    : 0

  const avgDailyReach = daily_data.length > 0
    ? daily_data.reduce((sum: number, d: any) => sum + (d.reach || 0), 0) / daily_data.length
    : 0

  // Crescimento comparando últimos 7 dias vs 7 dias anteriores
  const last7Days = daily_data.slice(0, 7)
  const previous7Days = daily_data.slice(7, 14)

  const last7DaysReach = last7Days.reduce((sum: number, d: any) => sum + (d.reach || 0), 0)
  const previous7DaysReach = previous7Days.reduce((sum: number, d: any) => sum + (d.reach || 0), 0)
  const reachGrowth = calculateGrowthPercentage(previous7DaysReach, last7DaysReach)

  // Melhor horário e dia para postar
  const postsWithTimestamp = top_posts.map((post: any) => ({
    timestamp: post.timestamp,
    engagement: post.likes + post.comments,
  }))

  const bestTime = postsWithTimestamp.length > 0
    ? findBestTimeToPost(postsWithTimestamp)
    : null

  const bestDays = postsWithTimestamp.length > 0
    ? findBestDaysToPost(postsWithTimestamp)
    : []

  return (
    <div className="space-y-6">
      {/* Botão Atualizar */}
      <div className="flex justify-end">
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 sm:px-4 py-2 sm:py-2 bg-primary hover:bg-primary/90 text-white rounded-lg sm:rounded-xl font-medium transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{loading ? 'Atualizando...' : 'Atualizar'}</span>
          <span className="sm:hidden">{loading ? 'Carregando...' : 'Atualizar'}</span>
        </button>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Eye className="w-5 h-5" />}
          label="Impressões (30d)"
          value={formatNumber(summary.total_impressions)}
          change={reachGrowth}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Alcance (30d)"
          value={formatNumber(summary.total_reach)}
          change={0}
          color="purple"
        />
        <MetricCard
          icon={<Heart className="w-5 h-5" />}
          label="Taxa de Engajamento"
          value={formatPercentage(summary.engagement_rate)}
          change={0}
          color="pink"
        />
        <MetricCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Total Comentários"
          value={formatNumber(summary.total_comments)}
          change={0}
          color="green"
        />
      </div>

      {/* Métricas Diárias Médias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Média Diária de Impressões</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(Math.round(avgDailyImpressions))}
          </p>
          <p className="text-sm text-gray-600 mt-1">Últimos 30 dias</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Média Diária de Alcance</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {formatNumber(Math.round(avgDailyReach))}
          </p>
          <p className="text-sm text-gray-600 mt-1">Últimos 30 dias</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Taxa de Alcance</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatPercentage((avgDailyReach / account.followers_count) * 100)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Do total de seguidores</p>
        </div>
      </div>

      {/* Melhor Horário e Dia para Postar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Melhor Horário */}
        {bestTime && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Melhor Horário para Postar
              </h3>
            </div>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-orange-600">
                {bestTime.hour}:00
              </p>
              <p className="text-gray-600 mt-2">
                Engajamento médio: {formatNumber(bestTime.engagement)}
              </p>
            </div>
          </div>
        )}

        {/* Melhores Dias */}
        {bestDays.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Melhores Dias para Postar
              </h3>
            </div>
            <div className="space-y-3">
              {bestDays.slice(0, 3).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{day.day}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatNumber(day.engagement)} eng.
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Posts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Award className="w-5 h-5 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Top 5 Posts (Maior Engajamento)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {top_posts.slice(0, 5).map((post: any, index: number) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Ranking Badge */}
              <div className="absolute top-2 left-2 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center z-10">
                <span className="text-sm font-bold text-white">{index + 1}</span>
              </div>

              {/* Image */}
              {post.media_url && (
                <img
                  src={post.media_url}
                  alt={post.caption}
                  className="w-full aspect-square object-cover"
                />
              )}

              {/* Overlay com Métricas */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {formatNumber(post.likes)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {formatNumber(post.comments)}
                    </div>
                  </div>
                  <p className="text-xs mt-2 opacity-80">
                    Engajamento: {formatPercentage(post.engagement_rate)}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Gráfico de Crescimento (Últimos 30 dias) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Alcance (Últimos 30 Dias)
        </h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {daily_data.slice(0, 30).reverse().map((day: any, index: number) => {
            const maxValue = Math.max(...daily_data.map((d: any) => d.reach || 0))
            const height = maxValue > 0 ? ((day.reach || 0) / maxValue) * 100 : 0

            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${height}%` }}
                title={`${day.date}: ${formatNumber(day.reach || 0)} alcance`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-600">
          <span>30 dias atrás</span>
          <span>Hoje</span>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para cards de métricas
function MetricCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: number
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    green: 'bg-green-100 text-green-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {change !== 0 && (
        <div className="flex items-center gap-1">
          <TrendingUp className={`w-4 h-4 ${change > 0 ? 'text-green-600' : 'text-red-600'}`} />
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{formatPercentage(change)}
          </span>
          <span className="text-xs text-gray-500">vs 7 dias atrás</span>
        </div>
      )}
    </div>
  )
}
