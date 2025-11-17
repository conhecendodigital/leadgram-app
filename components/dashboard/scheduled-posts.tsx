'use client'

import { useMemo } from 'react'
import { m } from 'framer-motion'
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  CalendarClock
} from 'lucide-react'
import Link from 'next/link'

interface ScheduledPostsProps {
  ideas: any[]
}

type ScheduledPost = {
  id: string
  title: string
  status: 'idea' | 'recorded' | 'posted'
  funnelStage: 'top' | 'middle' | 'bottom'
  createdAt: string
  recordedAt?: string
  thumbnailUrl?: string
  platforms: string[]
}

export default function ScheduledPosts({ ideas }: ScheduledPostsProps) {
  // Filtrar posts relevantes (ideias e gravados, não postados)
  const upcomingPosts = useMemo(() => {
    // Pegar apenas posts não postados (idea ou recorded)
    const filtered = ideas.filter((i: any) => i.status !== 'posted')

    // Mapear para o formato do componente
    const mapped: ScheduledPost[] = filtered.map((idea: any) => ({
      id: idea.id,
      title: idea.title,
      status: idea.status,
      funnelStage: idea.funnel_stage,
      createdAt: idea.created_at,
      recordedAt: idea.recorded_at,
      thumbnailUrl: idea.thumbnail_url,
      platforms: idea.idea_platforms?.map((p: any) => p.platform) || []
    }))

    // Ordenar por prioridade:
    // 1. Recorded (prontos para postar) primeiro
    // 2. Ideas (ainda em planejamento) depois
    // 3. Dentro de cada grupo, ordenar por data de criação (mais recentes primeiro)
    return mapped.sort((a, b) => {
      // Prioridade por status
      if (a.status === 'recorded' && b.status === 'idea') return -1
      if (a.status === 'idea' && b.status === 'recorded') return 1

      // Se mesmo status, ordenar por data (mais recente primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [ideas])

  // Estatísticas
  const stats = useMemo(() => ({
    recorded: upcomingPosts.filter(p => p.status === 'recorded').length,
    ideas: upcomingPosts.filter(p => p.status === 'idea').length,
    total: upcomingPosts.length
  }), [upcomingPosts])

  // Função para formatar data relativa
  const getRelativeDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    return `${Math.floor(diffDays / 30)} meses atrás`
  }

  // Ícone do funil
  const getFunnelIcon = (stage: string) => {
    switch (stage) {
      case 'top': return '🎯'
      case 'middle': return '💡'
      case 'bottom': return '🚀'
      default: return '📝'
    }
  }

  // Badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recorded':
        return {
          text: 'Gravado',
          color: 'bg-blue-100 text-blue-700',
          icon: Video
        }
      case 'idea':
        return {
          text: 'Em Planejamento',
          color: 'bg-purple-100 text-purple-700',
          icon: Lightbulb
        }
      default:
        return {
          text: 'Desconhecido',
          color: 'bg-gray-100 text-gray-700',
          icon: CheckCircle2
        }
    }
  }

  if (upcomingPosts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Próximos Posts</h3>
            <p className="text-sm text-gray-500">Seus agendamentos</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Nenhum post agendado</p>
          <p className="text-xs text-gray-400">Crie ideias ou grave conteúdos</p>
          <Link
            href="/dashboard/ideas/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            Nova Ideia
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Próximos Posts</h3>
            <p className="text-sm text-gray-500">
              {stats.recorded} gravados, {stats.ideas} em planejamento
            </p>
          </div>
        </div>

        {/* Ver todos */}
        <Link
          href="/dashboard/ideas"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Pills */}
      <div className="flex gap-2 mb-4">
        {stats.recorded > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
            <Video className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">{stats.recorded} prontos</span>
          </div>
        )}
        {stats.ideas > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
            <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">{stats.ideas} ideias</span>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {upcomingPosts.slice(0, 8).map((post, index) => {
          const statusBadge = getStatusBadge(post.status)
          const StatusIcon = statusBadge.icon

          return (
            <m.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/dashboard/ideas/${post.id}`}>
                <div className="group p-3 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail ou ícone */}
                    <div className="relative flex-shrink-0">
                      {post.thumbnailUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={post.thumbnailUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`
                          w-12 h-12 rounded-lg flex items-center justify-center
                          ${post.status === 'recorded'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                          }
                        `}>
                          <StatusIcon className="w-6 h-6 text-white" />
                        </div>
                      )}

                      {/* Badge de funil */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs border border-gray-200">
                        {getFunnelIcon(post.funnelStage)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {post.title}
                        </h4>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                      </div>

                      {/* Status e data */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.text}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getRelativeDate(post.recordedAt || post.createdAt)}
                        </span>
                      </div>

                      {/* Plataformas */}
                      {post.platforms.length > 0 && (
                        <div className="flex items-center gap-1">
                          {post.platforms.map((platform: string) => {
                            const platformIcons: Record<string, string> = {
                              instagram: '📸',
                              tiktok: '🎵',
                              youtube: '📺',
                              facebook: '👥'
                            }
                            return (
                              <span
                                key={platform}
                                className="text-xs px-1.5 py-0.5 bg-gray-100 rounded"
                                title={platform}
                              >
                                {platformIcons[platform] || '📱'}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </m.div>
          )
        })}
      </div>

      {/* Footer - CTA */}
      {upcomingPosts.length > 8 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/dashboard/ideas"
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Ver mais {upcomingPosts.length - 8} posts
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
