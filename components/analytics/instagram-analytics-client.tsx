'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Image from 'next/image'
import { TrendingUp, Users, Eye, Heart, MessageCircle, Calendar, Clock, List, Filter, Grid3X3, Film, Play, Lock, Zap, BarChart3, Image as ImageIcon } from 'lucide-react'
import {
  calculateGrowthPercentage,
  findBestTimeToPost,
  findBestDaysToPost,
  formatNumber,
  formatPercentage,
} from '@/lib/analytics/metrics'
import PremiumFeatureLock from '@/components/plan/premium-feature-lock'
import LineChart from '@/components/analytics/line-chart'
import Link from 'next/link'

type PostSortOption = 'engagement' | 'likes' | 'comments' | 'reach' | 'recent'
type PostCategory = 'all' | 'feed' | 'reels'
type TabType = 'overview' | 'posts'

interface InstagramAnalyticsClientProps {
  account: {
    id: string
    username: string
    followers_count: number
    follows_count: number
    media_count: number
  }
  historicalData: any[]
  planType: string
}

// Cache simples em memória (5 minutos)
const insightsCache: { data: any; timestamp: number } = { data: null, timestamp: 0 }
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export default function InstagramAnalyticsClient({
  account,
  historicalData,
  planType,
}: InstagramAnalyticsClientProps) {
  // Estados principais
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [insights, setInsights] = useState<any>(insightsCache.data)
  const [isLoadingInsights, setIsLoadingInsights] = useState(!insightsCache.data)
  const [postsLoaded, setPostsLoaded] = useState(false)

  // Verificar se tem acesso às métricas completas (Pro, Premium ou Admin)
  const hasFullAccess = planType === 'pro' || planType === 'premium' || planType === 'admin'
  const isFree = planType === 'free'

  // Estados de posts (lazy loaded)
  const [postSortBy, setPostSortBy] = useState<PostSortOption>('recent')
  const [postCategory, setPostCategory] = useState<PostCategory>('all')
  const [postsToShow, setPostsToShow] = useState(12) // Reduzido de 24 para 12

  // Ref para o elemento sentinela da rolagem infinita
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch de insights com cache
  const fetchInsights = useCallback(async (forceRefresh = false) => {
    // Verificar cache
    const now = Date.now()
    if (!forceRefresh && insightsCache.data && now - insightsCache.timestamp < CACHE_DURATION) {
      setInsights(insightsCache.data)
      setIsLoadingInsights(false)
      return
    }

    setIsLoadingInsights(true)
    try {
      const response = await fetch('/api/instagram/insights')
      const data = await response.json()

      if (response.ok) {
        // Atualizar cache
        insightsCache.data = data
        insightsCache.timestamp = now
        setInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setIsLoadingInsights(false)
    }
  }, [])

  // Buscar insights ao carregar (apenas para aba overview)
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchInsights()
    }
  }, [activeTab, fetchInsights])

  // Marcar posts como carregados quando mudar para aba de posts
  useEffect(() => {
    if (activeTab === 'posts' && !postsLoaded) {
      setPostsLoaded(true)
    }
  }, [activeTab, postsLoaded])

  // Auto-refresh a cada 5 minutos (apenas se estiver na aba overview)
  useEffect(() => {
    if (activeTab !== 'overview') return

    const interval = setInterval(() => {
      fetchInsights(true)
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [activeTab, fetchInsights])

  // Extrair dados do insights
  const summary = insights?.summary || { total_impressions: 0, total_reach: 0, engagement_rate: 0, total_comments: 0, feed_count: 0, reels_count: 0 }
  const daily_data = insights?.daily_data || []
  const top_posts = insights?.top_posts || []

  // Filtrar e ordenar posts
  const sortedPosts = useMemo(() => {
    if (!top_posts || top_posts.length === 0) return []

    let posts = [...top_posts]
    if (postCategory !== 'all') {
      posts = posts.filter((p: any) => p.category === postCategory)
    }

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
    if (activeTab !== 'posts') return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMorePosts) {
          setPostsToShow(prev => prev + 12)
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) observer.observe(currentRef)

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [hasMorePosts, activeTab])

  const sortOptions = [
    { value: 'recent', label: 'Mais Recentes' },
    { value: 'engagement', label: 'Maior Engajamento' },
    { value: 'likes', label: 'Mais Curtidas' },
    { value: 'comments', label: 'Mais Comentários' },
    { value: 'reach', label: 'Maior Alcance' },
  ]

  // Calcular métricas (memoizado)
  const metrics = useMemo(() => {
    const avgDailyImpressions = summary.total_impressions && daily_data.length > 0
      ? summary.total_impressions / daily_data.length : 0

    const avgDailyReach = daily_data.length > 0
      ? daily_data.reduce((sum: number, d: any) => sum + (d.reach || 0), 0) / daily_data.length : 0

    const last7Days = daily_data.slice(0, 7)
    const previous7Days = daily_data.slice(7, 14)
    const last7DaysReach = last7Days.reduce((sum: number, d: any) => sum + (d.reach || 0), 0)
    const previous7DaysReach = previous7Days.reduce((sum: number, d: any) => sum + (d.reach || 0), 0)
    const reachGrowth = calculateGrowthPercentage(previous7DaysReach, last7DaysReach)

    const recentPosts = top_posts.slice(0, 7)
    const olderPosts = top_posts.slice(7, 14)
    const recentEngagement = recentPosts.reduce((sum: number, p: any) => sum + (p.likes || 0) + (p.comments || 0), 0)
    const olderEngagement = olderPosts.reduce((sum: number, p: any) => sum + (p.likes || 0) + (p.comments || 0), 0)
    const engagementGrowth = calculateGrowthPercentage(olderEngagement, recentEngagement)

    const recentComments = recentPosts.reduce((sum: number, p: any) => sum + (p.comments || 0), 0)
    const olderComments = olderPosts.reduce((sum: number, p: any) => sum + (p.comments || 0), 0)
    const commentsGrowth = calculateGrowthPercentage(olderComments, recentComments)

    const postsWithTimestamp = top_posts.map((post: any) => ({
      timestamp: post.timestamp,
      engagement: post.likes + post.comments,
    }))

    const bestTime = postsWithTimestamp.length > 0 ? findBestTimeToPost(postsWithTimestamp) : null
    const bestDays = postsWithTimestamp.length > 0 ? findBestDaysToPost(postsWithTimestamp) : []

    return {
      avgDailyImpressions,
      avgDailyReach,
      reachGrowth,
      engagementGrowth,
      commentsGrowth,
      bestTime,
      bestDays,
    }
  }, [summary, daily_data, top_posts])

  return (
    <div className="space-y-6">
      {/* Banner informativo para usuários Free */}
      {isFree && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Você está no plano Free
              </h3>
              <p className="text-sm text-gray-600">
                Faça upgrade para o plano Pro e tenha acesso a métricas completas,
                gráficos históricos, melhores horários para postar e muito mais!
              </p>
            </div>
            <Link
              href="/dashboard/settings?tab=plan"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-center"
            >
              Ver planos
            </Link>
          </div>
        </div>
      )}

      {/* Abas de navegação */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary/5 text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-primary/5 text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Posts
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'posts' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
            }`}>
              {top_posts.length}
            </span>
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div className="p-6">
          {activeTab === 'overview' ? (
            <OverviewTab
              isLoading={isLoadingInsights}
              summary={summary}
              metrics={metrics}
              daily_data={daily_data}
              top_posts={top_posts}
              account={account}
              hasFullAccess={hasFullAccess}
              isFree={isFree}
            />
          ) : (
            <PostsTab
              isLoading={!postsLoaded && isLoadingInsights}
              sortedPosts={sortedPosts}
              paginatedPosts={paginatedPosts}
              hasMorePosts={hasMorePosts}
              postCategory={postCategory}
              setPostCategory={setPostCategory}
              postSortBy={postSortBy}
              setPostSortBy={setPostSortBy}
              setPostsToShow={setPostsToShow}
              sortOptions={sortOptions}
              feedCount={feedCount}
              reelsCount={reelsCount}
              top_posts={top_posts}
              loadMoreRef={loadMoreRef}
              hasFullAccess={hasFullAccess}
              isFree={isFree}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ===== COMPONENTE: Skeleton Loading =====
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-20" />
    </div>
  )
}

function SkeletonGraph() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
      <div className="h-64 bg-gray-100 rounded flex items-end justify-between gap-1 p-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function SkeletonPostGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-xl aspect-square" />
      ))}
    </div>
  )
}

// ===== COMPONENTE: Aba Visão Geral =====
function OverviewTab({
  isLoading,
  summary,
  metrics,
  daily_data,
  top_posts,
  account,
  hasFullAccess,
  isFree,
}: {
  isLoading: boolean
  summary: any
  metrics: any
  daily_data: any[]
  top_posts: any[]
  account: any
  hasFullAccess: boolean
  isFree: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonGraph />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Eye className="w-5 h-5" />}
          label="Impressões (30d)"
          value={formatNumber(summary.total_impressions)}
          change={metrics.reachGrowth}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Alcance (30d)"
          value={formatNumber(summary.total_reach)}
          change={metrics.reachGrowth}
          color="purple"
        />
        <MetricCard
          icon={<Heart className="w-5 h-5" />}
          label="Taxa de Engajamento"
          value={formatPercentage(summary.engagement_rate)}
          change={metrics.engagementGrowth}
          color="pink"
        />
        <MetricCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Total Comentários"
          value={formatNumber(summary.total_comments)}
          change={metrics.commentsGrowth}
          color="green"
        />
      </div>

      {/* Métricas Diárias Médias - Apenas Pro/Premium */}
      {hasFullAccess ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Média Diária de Impressões</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {formatNumber(Math.round(metrics.avgDailyImpressions))}
            </p>
            <p className="text-sm text-gray-600 mt-1">Últimos 30 dias</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Média Diária de Alcance</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {formatNumber(Math.round(metrics.avgDailyReach))}
            </p>
            <p className="text-sm text-gray-600 mt-1">Últimos 30 dias</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Taxa de Alcance</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {account.followers_count > 0
                ? formatPercentage((metrics.avgDailyReach / account.followers_count) * 100)
                : formatPercentage(0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Do total de seguidores</p>
          </div>
        </div>
      ) : (
        <PremiumFeatureLock
          title="Métricas Diárias Detalhadas"
          description="Veja a média diária de impressões, alcance e taxa de alcance dos seus posts."
          requiredPlan="pro"
        />
      )}

      {/* Melhor Horário e Dia - Apenas Pro/Premium */}
      {hasFullAccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {metrics.bestTime && (
            <div className="bg-gray-50 rounded-2xl p-6">
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
                  {metrics.bestTime.hour}:00
                </p>
                <p className="text-gray-600 mt-2">
                  Engajamento médio: {formatNumber(metrics.bestTime.engagement)}
                </p>
              </div>
            </div>
          )}

          {metrics.bestDays.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Melhores Dias para Postar
                </h3>
              </div>
              <div className="space-y-3">
                {metrics.bestDays.slice(0, 3).map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
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
      ) : (
        <PremiumFeatureLock
          title="Melhores Horários e Dias para Postar"
          description="Descubra os horários e dias da semana que geram mais engajamento nos seus posts."
          requiredPlan="pro"
        />
      )}

      {/* Gráficos de Métricas - Apenas Pro/Premium */}
      {hasFullAccess ? (
        <AnalyticsCharts daily_data={daily_data} top_posts={top_posts} />
      ) : (
        <PremiumFeatureLock
          title="Gráficos de Métricas"
          description="Visualize a evolução do alcance, engajamento e outras métricas ao longo do tempo."
          requiredPlan="pro"
        />
      )}
    </div>
  )
}

// ===== COMPONENTE: Gráficos de Analytics =====
type TimePeriod = 'week' | 'month' | 'year'

function AnalyticsCharts({
  daily_data,
  top_posts,
}: {
  daily_data: any[]
  top_posts: any[]
}) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')

  // Função para filtrar dados por período
  const filterDataByPeriod = useCallback((data: any[], period: TimePeriod) => {
    const now = new Date()
    let daysToShow = 30

    switch (period) {
      case 'week':
        daysToShow = 7
        break
      case 'month':
        daysToShow = 30
        break
      case 'year':
        daysToShow = 365
        break
    }

    return data.slice(0, daysToShow).reverse()
  }, [])

  // Preparar dados para os gráficos baseado no período
  const chartData = useMemo(() => {
    const daysCount = timePeriod === 'week' ? 7 : timePeriod === 'month' ? 30 : 365

    // Criar mapa de dados diários por data (da API de métricas da conta)
    const dailyDataMap = new Map<string, any>()
    daily_data.forEach((day: any) => {
      const dateStr = day.date?.split('T')[0] || day.date
      dailyDataMap.set(dateStr, day)
    })

    // Agregar TODOS os dados dos posts por dia (incluindo impressions e reach)
    const postsByDay = new Map<string, {
      likes: number
      comments: number
      engagement: number
      impressions: number
      reach: number
      posts: number
    }>()

    top_posts.forEach((post: any) => {
      if (post.timestamp) {
        const dateStr = post.timestamp.split('T')[0]
        const existing = postsByDay.get(dateStr) || {
          likes: 0, comments: 0, engagement: 0, impressions: 0, reach: 0, posts: 0
        }
        postsByDay.set(dateStr, {
          likes: existing.likes + (post.likes || 0),
          comments: existing.comments + (post.comments || 0),
          engagement: existing.engagement + (post.likes || 0) + (post.comments || 0),
          impressions: existing.impressions + (post.impressions || 0),
          reach: existing.reach + (post.reach || 0),
          posts: existing.posts + 1,
        })
      }
    })

    // Gerar array de datas para o período
    const dates: string[] = []
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dates.push(dateStr)
    }

    // Mapear dados para cada métrica
    // Prioridade: dados da API da conta > dados agregados dos posts
    const reachData = dates.map(date => ({
      date,
      value: dailyDataMap.get(date)?.reach || postsByDay.get(date)?.reach || 0,
    }))

    // Impressões: usar dados dos posts (são mais precisos para o dia)
    const impressionsData = dates.map(date => ({
      date,
      value: postsByDay.get(date)?.impressions || dailyDataMap.get(date)?.impressions || 0,
    }))

    // Seguidores: dados da API da conta
    const followersData = dates.map(date => ({
      date,
      value: dailyDataMap.get(date)?.follower_count || 0,
    }))

    // Likes e Comments: dados dos posts
    const likesData = dates.map(date => ({
      date,
      value: postsByDay.get(date)?.likes || 0,
    }))

    const commentsData = dates.map(date => ({
      date,
      value: postsByDay.get(date)?.comments || 0,
    }))

    // Engajamento: likes + comments
    const engagementData = dates.map(date => ({
      date,
      value: postsByDay.get(date)?.engagement || 0,
    }))

    return { reachData, impressionsData, followersData, engagementData, likesData, commentsData }
  }, [daily_data, top_posts, timePeriod])

  // Configurações dos gráficos
  const chartConfigs = [
    {
      key: 'reach',
      title: 'Alcance',
      description: 'Contas alcançadas por dia',
      data: chartData.reachData,
      color: '#8B5CF6',
      gradientFrom: '#3B82F6',
      gradientTo: '#8B5CF6',
      icon: Users,
    },
    {
      key: 'impressions',
      title: 'Impressões',
      description: 'Visualizações de posts por dia',
      data: chartData.impressionsData,
      color: '#3B82F6',
      gradientFrom: '#06B6D4',
      gradientTo: '#3B82F6',
      icon: Eye,
    },
    {
      key: 'engagement',
      title: 'Engajamento',
      description: 'Interações por dia (likes + comentários)',
      data: chartData.engagementData,
      color: '#EC4899',
      gradientFrom: '#EC4899',
      gradientTo: '#F43F5E',
      icon: Heart,
    },
    {
      key: 'likes',
      title: 'Curtidas',
      description: 'Curtidas recebidas por dia',
      data: chartData.likesData,
      color: '#EF4444',
      gradientFrom: '#F97316',
      gradientTo: '#EF4444',
      icon: Heart,
    },
    {
      key: 'comments',
      title: 'Comentários',
      description: 'Comentários recebidos por dia',
      data: chartData.commentsData,
      color: '#06B6D4',
      gradientFrom: '#06B6D4',
      gradientTo: '#0891B2',
      icon: MessageCircle,
    },
    {
      key: 'followers',
      title: 'Seguidores',
      description: 'Evolução diária de seguidores',
      data: chartData.followersData,
      color: '#10B981',
      gradientFrom: '#10B981',
      gradientTo: '#059669',
      icon: Users,
    },
  ]

  const periodLabels = {
    week: 'Última Semana',
    month: 'Último Mês',
    year: 'Último Ano',
  }

  return (
    <div className="space-y-6">
      {/* Header com filtro de tempo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Evolução das Métricas</h3>
          <p className="text-sm text-gray-500">Acompanhe o desempenho ao longo do tempo</p>
        </div>

        {/* Filtro de período */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['week', 'month', 'year'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timePeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartConfigs.map((config) => (
          <ChartCard
            key={config.key}
            config={config}
            periodLabel={periodLabels[timePeriod]}
          />
        ))}
      </div>
    </div>
  )
}

// ===== COMPONENTE: Card de Gráfico Individual =====
function ChartCard({
  config,
  periodLabel,
}: {
  config: {
    key: string
    title: string
    description: string
    data: { date: string; value: number }[]
    color: string
    gradientFrom: string
    gradientTo: string
    icon: any
  }
  periodLabel: string
}) {
  const Icon = config.icon
  const values = config.data.map(d => d.value)
  const nonZeroValues = values.filter(v => v > 0)

  // Calcular estatísticas
  const total = values.reduce((a, b) => a + b, 0)
  const avg = values.length > 0 ? total / values.length : 0
  const min = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0
  const max = Math.max(...values) || 0

  // Calcular variação (primeiro vs último)
  const firstValue = values[0] || 0
  const lastValue = values[values.length - 1] || 0
  const variation = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0

  return (
    <div className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-shadow">
      {/* Header do Card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{config.title}</h4>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>

        {/* Badge de variação */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          variation >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <TrendingUp className={`w-3 h-3 ${variation < 0 ? 'rotate-180' : ''}`} />
          {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
        </div>
      </div>

      {/* Valor Principal */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">{formatNumber(total)}</p>
        <p className="text-xs text-gray-500">{periodLabel}</p>
      </div>

      {/* Gráfico */}
      <LineChart
        data={config.data}
        color={config.color}
        gradientFrom={config.gradientFrom}
        gradientTo={config.gradientTo}
        height={180}
        title={config.title}
        formatValue={(v) => formatNumber(v)}
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Mínimo</p>
          <p className="text-sm font-semibold text-gray-700">{formatNumber(min)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Média</p>
          <p className="text-sm font-semibold text-gray-700">{formatNumber(Math.round(avg))}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Máximo</p>
          <p className="text-sm font-semibold text-gray-700">{formatNumber(max)}</p>
        </div>
      </div>
    </div>
  )
}

// ===== COMPONENTE: Aba Posts =====
function PostsTab({
  isLoading,
  sortedPosts,
  paginatedPosts,
  hasMorePosts,
  postCategory,
  setPostCategory,
  postSortBy,
  setPostSortBy,
  setPostsToShow,
  sortOptions,
  feedCount,
  reelsCount,
  top_posts,
  loadMoreRef,
  hasFullAccess,
  isFree,
}: {
  isLoading: boolean
  sortedPosts: any[]
  paginatedPosts: any[]
  hasMorePosts: boolean
  postCategory: PostCategory
  setPostCategory: (c: PostCategory) => void
  postSortBy: PostSortOption
  setPostSortBy: (s: PostSortOption) => void
  setPostsToShow: (n: number | ((prev: number) => number)) => void
  sortOptions: { value: string; label: string }[]
  feedCount: number
  reelsCount: number
  top_posts: any[]
  loadMoreRef: React.RefObject<HTMLDivElement | null>
  hasFullAccess: boolean
  isFree: boolean
}) {
  if (isLoading) {
    return <SkeletonPostGrid />
  }

  return (
    <div className="space-y-4">
      {/* Header com filtros - Apenas Pro/Premium */}
      {hasFullAccess && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {top_posts.length} posts no total • {feedCount} feed • {reelsCount} reels
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={postSortBy}
                onChange={(e) => {
                  setPostSortBy(e.target.value as PostSortOption)
                  setPostsToShow(12)
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
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setPostCategory('all'); setPostsToShow(12) }}
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
              onClick={() => { setPostCategory('feed'); setPostsToShow(12) }}
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
              onClick={() => { setPostCategory('reels'); setPostsToShow(12) }}
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
        </>
      )}

      {/* Info para Free */}
      {isFree && (
        <p className="text-sm text-gray-500">
          Mostrando 6 de {top_posts.length} posts
        </p>
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
            {(isFree ? sortedPosts.slice(0, 6) : paginatedPosts).map((post: any, index: number) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>

                {post.category === 'reels' && (
                  <div className="absolute top-2 right-2 z-10">
                    <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                  </div>
                )}

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

          {/* Sentinela/CTA */}
          {isFree ? (
            <div className="mt-6 py-6 text-center border-t border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Veja todos os {sortedPosts.length} posts
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Faça upgrade para Pro e tenha acesso a análise detalhada de todos os seus posts
              </p>
              <Link
                href="/dashboard/settings?tab=plan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                <Zap className="w-5 h-5" />
                Ver planos
              </Link>
            </div>
          ) : (
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
          )}
        </>
      )}
    </div>
  )
}

// ===== COMPONENTE: Card de Métrica =====
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
    <div className="bg-gray-50 rounded-2xl p-6">
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
