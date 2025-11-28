'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { TrendingUp, Users, Eye, Heart, MessageCircle, Calendar, Clock, List, Filter, Grid3X3, Film, Play } from 'lucide-react'
import {
  calculateEngagementRate,
  calculateGrowthPercentage,
  findBestTimeToPost,
  findBestDaysToPost,
  formatNumber,
  formatPercentage,
} from '@/lib/analytics/metrics'

type PostSortOption = 'engagement' | 'likes' | 'comments' | 'reach' | 'recent'
type PostCategory = 'all' | 'feed' | 'reels'

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
  const [insights, setInsights] = useState<any>(null)
  const [postSortBy, setPostSortBy] = useState<PostSortOption>('engagement')
  const [postCategory, setPostCategory] = useState<PostCategory>('all')
  const [postsToShow, setPostsToShow] = useState(24)

  // Ref para o elemento sentinela da rolagem infinita
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Buscar insights ao carregar
  useEffect(() => {
    fetchInsights()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-refresh silencioso a cada 60 segundos em background
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInsights()
    }, 60000) // 60 segundos

    return () => clearInterval(interval)
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/instagram/insights')
      const data = await response.json()

      if (!response.ok) {
        console.error('Erro detalhado da API:', data)
        return
      }

      setInsights(data)
    } catch (error: any) {
      console.error('Error fetching insights:', error)
    }
  }

  // Extrair dados do insights (ou valores padrão se não houver dados)
  const summary = insights?.summary || { total_impressions: 0, total_reach: 0, engagement_rate: 0, total_comments: 0, feed_count: 0, reels_count: 0 }
  const daily_data = insights?.daily_data || []
  const top_posts = insights?.top_posts || []

  // Filtrar e ordenar posts baseado na categoria e filtro selecionados
  // IMPORTANTE: useMemo deve estar ANTES de qualquer return condicional
  const sortedPosts = useMemo(() => {
    if (!top_posts || top_posts.length === 0) return []

    // Primeiro filtrar por categoria (se não for "all")
    let posts = [...top_posts]
    if (postCategory !== 'all') {
      posts = posts.filter((p: any) => p.category === postCategory)
    }

    // Depois ordenar
    switch (postSortBy) {
      case 'engagement':
        return posts.sort((a: any, b: any) => b.engagement - a.engagement)
      case 'likes':
        return posts.sort((a: any, b: any) => b.likes - a.likes)
      case 'comments':
        return posts.sort((a: any, b: any) => b.comments - a.comments)
      case 'reach':
        return posts.sort((a: any, b: any) => (b.reach || 0) - (a.reach || 0))
      case 'recent':
        return posts.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      default:
        return posts
    }
  }, [top_posts, postSortBy, postCategory])

  const paginatedPosts = sortedPosts.slice(0, postsToShow)
  const hasMorePosts = sortedPosts.length > postsToShow

  // Contar posts por categoria
  const feedCount = useMemo(() => top_posts.filter((p: any) => p.category === 'feed').length, [top_posts])
  const reelsCount = useMemo(() => top_posts.filter((p: any) => p.category === 'reels').length, [top_posts])

  // Intersection Observer para rolagem infinita
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMorePosts) {
          setPostsToShow(prev => prev + 24)
        }
      },
      {
        root: null,
        rootMargin: '100px', // Carrega antes de chegar ao fim
        threshold: 0.1,
      }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMorePosts])

  const sortOptions = [
    { value: 'engagement', label: 'Maior Engajamento' },
    { value: 'likes', label: 'Mais Curtidas' },
    { value: 'comments', label: 'Mais Comentários' },
    { value: 'reach', label: 'Maior Alcance' },
    { value: 'recent', label: 'Mais Recentes' },
  ]

  // Loading state - agora DEPOIS de todos os hooks
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

  // Calcular crescimento de engajamento (últimos 7 posts vs 7 anteriores)
  const recentPosts = top_posts.slice(0, 7)
  const olderPosts = top_posts.slice(7, 14)

  const recentEngagement = recentPosts.reduce((sum: number, p: any) => sum + (p.likes || 0) + (p.comments || 0), 0)
  const olderEngagement = olderPosts.reduce((sum: number, p: any) => sum + (p.likes || 0) + (p.comments || 0), 0)
  const engagementGrowth = calculateGrowthPercentage(olderEngagement, recentEngagement)

  // Calcular crescimento de comentários
  const recentComments = recentPosts.reduce((sum: number, p: any) => sum + (p.comments || 0), 0)
  const olderComments = olderPosts.reduce((sum: number, p: any) => sum + (p.comments || 0), 0)
  const commentsGrowth = calculateGrowthPercentage(olderComments, recentComments)

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
          change={reachGrowth}
          color="purple"
        />
        <MetricCard
          icon={<Heart className="w-5 h-5" />}
          label="Taxa de Engajamento"
          value={formatPercentage(summary.engagement_rate)}
          change={engagementGrowth}
          color="pink"
        />
        <MetricCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Total Comentários"
          value={formatNumber(summary.total_comments)}
          change={commentsGrowth}
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
            {account.followers_count > 0
              ? formatPercentage((avgDailyReach / account.followers_count) * 100)
              : formatPercentage(0)}
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
          <span className="hidden sm:inline">~15 dias</span>
          <span>Hoje</span>
        </div>
      </div>

      {/* Listagem de Todos os Posts com Abas Feed/Reels */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* Header com título e filtro */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <List className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Todos os Posts
              </h3>
              <p className="text-sm text-gray-500">
                {top_posts.length} posts no total • {feedCount} feed • {reelsCount} reels
              </p>
            </div>
          </div>

          {/* Filtro de Ordenação */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={postSortBy}
              onChange={(e) => {
                setPostSortBy(e.target.value as PostSortOption)
                setPostsToShow(12) // Reset paginação ao mudar filtro
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Abas Feed / Reels */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => {
              setPostCategory('all')
              setPostsToShow(12)
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              postCategory === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
            Todos
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              postCategory === 'all' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
            }`}>
              {top_posts.length}
            </span>
          </button>
          <button
            onClick={() => {
              setPostCategory('feed')
              setPostsToShow(12)
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              postCategory === 'feed'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Feed
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              postCategory === 'feed' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
            }`}>
              {feedCount}
            </span>
          </button>
          <button
            onClick={() => {
              setPostCategory('reels')
              setPostsToShow(12)
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              postCategory === 'reels'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Film className="w-4 h-4" />
            Reels
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              postCategory === 'reels' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
            }`}>
              {reelsCount}
            </span>
          </button>
        </div>

        {/* Indicador de filtro ativo */}
        {postSortBy !== 'engagement' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <span>Ordenado por:</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
              {sortOptions.find(o => o.value === postSortBy)?.label}
            </span>
            <span className="text-gray-400">•</span>
            <span>{sortedPosts.length} posts</span>
          </div>
        )}

        {/* Grid de Posts */}
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {postCategory === 'reels' ? (
                <Film className="w-8 h-8 text-gray-400" />
              ) : (
                <Grid3X3 className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-gray-500">
              {postCategory === 'feed' && 'Nenhum post de feed encontrado'}
              {postCategory === 'reels' && 'Nenhum reel encontrado'}
              {postCategory === 'all' && 'Nenhum post encontrado'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {paginatedPosts.map((post: any, index: number) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  {/* Ranking Badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>

                  {/* Indicador de Reels */}
                  {post.category === 'reels' && (
                    <div className="absolute top-2 right-2 z-10">
                      <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                    </div>
                  )}

                  {/* Image */}
                  {(post.media_url || post.thumbnail_url) && (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={post.thumbnail_url || post.media_url}
                        alt={post.caption || `Post ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                  )}

                  {/* Overlay com Métricas */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(post.likes)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {formatNumber(post.comments)}
                        </div>
                      </div>
                      {post.reach > 0 && (
                        <p className="text-xs mt-1 opacity-80">
                          Alcance: {formatNumber(post.reach)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Métricas Visíveis (Mobile) */}
                  <div className="p-2 sm:hidden">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-500" />
                        {formatNumber(post.likes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-blue-500" />
                        {formatNumber(post.comments)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Sentinela para Rolagem Infinita */}
            <div ref={loadMoreRef} className="mt-6 py-4">
              {hasMorePosts && (
                <div className="flex items-center justify-center gap-3 text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm">Carregando mais posts...</span>
                </div>
              )}
              {!hasMorePosts && sortedPosts.length > 0 && (
                <p className="text-center text-sm text-gray-400">
                  Todos os {sortedPosts.length} posts carregados
                </p>
              )}
            </div>
          </>
        )}
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
