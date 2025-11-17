'use client'

import { useMemo } from 'react'
import { m } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Award,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react'

interface InsightsWidgetProps {
  ideas: any[]
  stats: {
    totalViews: number
    totalLikes: number
    totalComments: number
    engagementRate: string
  }
}

type InsightType = 'success' | 'warning' | 'tip' | 'trend'

type Insight = {
  id: string
  type: InsightType
  title: string
  description: string
  icon: any
  color: string
  gradient: string
  action?: {
    label: string
    href: string
  }
}

export default function InsightsWidget({ ideas, stats }: InsightsWidgetProps) {
  const postedIdeas = useMemo(() => {
    return ideas.filter((i: any) => i.status === 'posted')
  }, [ideas])

  // Análise de dados e geração de insights
  const insights: Insight[] = useMemo(() => {
    const generatedInsights: Insight[] = []

    // 1. Análise de engajamento
    const engagementRate = parseFloat(stats.engagementRate)
    if (engagementRate > 5) {
      generatedInsights.push({
        id: 'high-engagement',
        type: 'success',
        title: 'Excelente Engajamento!',
        description: `Sua taxa de ${engagementRate.toFixed(1)}% está acima da média. Continue criando conteúdo de qualidade!`,
        icon: TrendingUp,
        color: 'text-green-600',
        gradient: 'from-green-500 to-emerald-500'
      })
    } else if (engagementRate < 2) {
      generatedInsights.push({
        id: 'low-engagement',
        type: 'warning',
        title: 'Engajamento Baixo',
        description: 'Tente usar mais CTAs nos seus posts e interagir mais com seus seguidores.',
        icon: AlertCircle,
        color: 'text-amber-600',
        gradient: 'from-amber-500 to-orange-500',
        action: {
          label: 'Ver dicas',
          href: '/dashboard/ideas/new'
        }
      })
    }

    // 2. Análise de plataformas
    const platformData: Record<string, { views: number, engagement: number, count: number }> = {}
    postedIdeas.forEach((idea: any) => {
      idea.idea_platforms?.forEach((platform: any) => {
        const platformName = platform.platform
        const metrics = platform.metrics?.[0]
        if (!platformData[platformName]) {
          platformData[platformName] = { views: 0, engagement: 0, count: 0 }
        }
        platformData[platformName].views += metrics?.views || 0
        platformData[platformName].engagement += metrics?.likes + metrics?.comments || 0
        platformData[platformName].count += 1
      })
    })

    const bestPlatform = Object.entries(platformData).sort((a, b) => {
      const engA = a[1].views > 0 ? (a[1].engagement / a[1].views) * 100 : 0
      const engB = b[1].views > 0 ? (b[1].engagement / b[1].views) * 100 : 0
      return engB - engA
    })[0]

    if (bestPlatform && bestPlatform[1].count > 2) {
      const platformEmojis: Record<string, string> = {
        instagram: '📸',
        tiktok: '🎵',
        youtube: '📺',
        facebook: '👥',
        twitter: '🐦',
        linkedin: '💼'
      }
      const platformNames: Record<string, string> = {
        instagram: 'Instagram',
        tiktok: 'TikTok',
        youtube: 'YouTube',
        facebook: 'Facebook',
        twitter: 'Twitter',
        linkedin: 'LinkedIn'
      }

      generatedInsights.push({
        id: 'best-platform',
        type: 'success',
        title: 'Plataforma Destaque',
        description: `${platformEmojis[bestPlatform[0]] || '📱'} ${platformNames[bestPlatform[0]] || bestPlatform[0]} está trazendo os melhores resultados. Considere aumentar a frequência lá!`,
        icon: Target,
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-cyan-500'
      })
    }

    // 3. Análise de frequência de posts
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const postsLast30Days = postedIdeas.filter((i: any) =>
      new Date(i.created_at) >= last30Days
    ).length

    if (postsLast30Days < 4) {
      generatedInsights.push({
        id: 'low-frequency',
        type: 'tip',
        title: 'Aumente sua Frequência',
        description: `Você postou ${postsLast30Days} vezes nos últimos 30 dias. Postar regularmente (2-3x/semana) aumenta o alcance.`,
        icon: Calendar,
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-pink-500',
        action: {
          label: 'Criar ideia',
          href: '/dashboard/ideas/new'
        }
      })
    } else if (postsLast30Days >= 12) {
      generatedInsights.push({
        id: 'high-frequency',
        type: 'success',
        title: 'Frequência Excelente!',
        description: `${postsLast30Days} posts nos últimos 30 dias! Você está no caminho certo para crescer seu alcance.`,
        icon: Award,
        color: 'text-green-600',
        gradient: 'from-green-500 to-emerald-500'
      })
    }

    // 4. Análise de funil
    const funnelData = {
      top: postedIdeas.filter((i: any) => i.funnel_stage === 'top').length,
      middle: postedIdeas.filter((i: any) => i.funnel_stage === 'middle').length,
      bottom: postedIdeas.filter((i: any) => i.funnel_stage === 'bottom').length
    }

    const total = funnelData.top + funnelData.middle + funnelData.bottom
    if (total > 5) {
      const topPercentage = (funnelData.top / total) * 100
      const bottomPercentage = (funnelData.bottom / total) * 100

      if (topPercentage < 30) {
        generatedInsights.push({
          id: 'funnel-top',
          type: 'tip',
          title: 'Atraia Mais Audiência',
          description: 'Crie mais conteúdo de topo de funil (educativo/viral) para atrair novos seguidores.',
          icon: Users,
          color: 'text-indigo-600',
          gradient: 'from-indigo-500 to-purple-500',
          action: {
            label: 'Nova ideia',
            href: '/dashboard/ideas/new'
          }
        })
      }

      if (bottomPercentage < 15) {
        generatedInsights.push({
          id: 'funnel-bottom',
          type: 'tip',
          title: 'Converta Mais',
          description: 'Adicione conteúdo de fundo de funil (vendas/conversão) para monetizar sua audiência.',
          icon: Target,
          color: 'text-rose-600',
          gradient: 'from-rose-500 to-pink-500',
          action: {
            label: 'Ver estratégias',
            href: '/dashboard/ideas/new'
          }
        })
      }
    }

    // 5. Análise de crescimento
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const postsLast7Days = postedIdeas.filter((i: any) =>
      new Date(i.created_at) >= last7Days
    )

    const viewsLast7Days = postsLast7Days.reduce((sum: number, idea: any) => {
      return sum + (idea.idea_platforms?.reduce((pSum: number, p: any) => {
        return pSum + (p.metrics?.[0]?.views || 0)
      }, 0) || 0)
    }, 0)

    if (viewsLast7Days > 1000 && postsLast7Days.length >= 2) {
      generatedInsights.push({
        id: 'trending',
        type: 'trend',
        title: 'Você está em alta!',
        description: `${viewsLast7Days.toLocaleString()} visualizações nos últimos 7 dias. Seu conteúdo está alcançando mais pessoas!`,
        icon: BarChart3,
        color: 'text-cyan-600',
        gradient: 'from-cyan-500 to-blue-500'
      })
    }

    // 6. Insight genérico de motivação se não houver insights
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'keep-going',
        type: 'tip',
        title: 'Continue Criando!',
        description: 'Publique mais conteúdo para gerar insights personalizados sobre seu desempenho.',
        icon: Lightbulb,
        color: 'text-indigo-600',
        gradient: 'from-indigo-500 to-purple-500',
        action: {
          label: 'Nova ideia',
          href: '/dashboard/ideas/new'
        }
      })
    }

    // Limitar a 4 insights mais relevantes
    return generatedInsights.slice(0, 4)
  }, [ideas, postedIdeas, stats])

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case 'success': return { bg: 'bg-green-100', text: 'text-green-600' }
      case 'warning': return { bg: 'bg-amber-100', text: 'text-amber-600' }
      case 'tip': return { bg: 'bg-purple-100', text: 'text-purple-600' }
      case 'trend': return { bg: 'bg-cyan-100', text: 'text-cyan-600' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-600' }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Insights Inteligentes</h3>
          <p className="text-sm text-gray-500">Sugestões baseadas nos seus dados</p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const iconStyle = getInsightIcon(insight.type)
          const Icon = insight.icon

          return (
            <m.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    bg-gradient-to-br ${insight.gradient}
                  `}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm mb-1 ${insight.color}`}>
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {insight.description}
                    </p>

                    {/* Action Button */}
                    {insight.action && (
                      <a
                        href={insight.action.href}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
                      >
                        {insight.action.label}
                        <m.span
                          className="inline-block"
                          initial={{ x: 0 }}
                          whileHover={{ x: 3 }}
                        >
                          →
                        </m.span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </m.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 Insights atualizados em tempo real baseados no seu desempenho
        </p>
      </div>
    </div>
  )
}
