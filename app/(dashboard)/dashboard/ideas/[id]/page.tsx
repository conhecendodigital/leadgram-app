import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight, Edit, Trash2, Instagram, Youtube, Facebook, Eye, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import StatusBadge from '@/components/ideas/status-badge'
import FunnelBadge from '@/components/ideas/funnel-badge'
import DeleteButton from './delete-button'

import type { Database } from '@/types/database.types'

type IdeaWithRelations = Database['public']['Tables']['ideas']['Row'] & {
  platforms?: Array<Database['public']['Tables']['idea_platforms']['Row'] & {
    metrics?: Array<any>
  }>
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const supabase = await createServerClient()
  const { id } = await params

  const { data } = await supabase
    .from('ideas')
    .select(`
      *,
      platforms:idea_platforms(
        id,
        platform,
        platform_post_id,
        post_url,
        posted_at,
        is_posted,
        metrics(*)
      )
    `)
    .eq('id', id)
    .single()

  const idea = data as IdeaWithRelations | null

  if (!idea) {
    notFound()
  }

  const platformIcons: Record<string, React.ElementType> = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    tiktok: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
  }

  // Calcular métricas totais
  const totalMetrics = idea.platforms?.reduce(
    (acc, platform) => {
      const latestMetric = platform.metrics?.[0]
      if (latestMetric) {
        return {
          views: acc.views + latestMetric.views,
          likes: acc.likes + latestMetric.likes,
          comments: acc.comments + latestMetric.comments,
          shares: acc.shares + latestMetric.shares,
          saves: acc.saves + latestMetric.saves,
        }
      }
      return acc
    },
    { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
  )

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/dashboard/ideas" className="hover:text-primary transition-colors">
            Ideias
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium line-clamp-1">{idea.title}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={idea.status} />
                <FunnelBadge stage={idea.funnel_stage} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{idea.title}</h1>
              {idea.theme && (
                <p className="text-lg text-gray-600">{idea.theme}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/dashboard/ideas/${idea.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              <DeleteButton ideaId={idea.id} />
            </div>
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              Criado em {format(new Date(idea.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            {idea.recorded_at && (
              <span>
                • Gravado em {format(new Date(idea.recorded_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            )}
            {idea.posted_at && (
              <span>
                • Postado em {format(new Date(idea.posted_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        {/* Métricas Totais */}
        {totalMetrics && (totalMetrics.views > 0 || totalMetrics.likes > 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas Totais</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-medium">Visualizações</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.views.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">Curtidas</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.likes.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Comentários</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.comments.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Compartilhamentos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.shares.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Bookmark className="w-5 h-5" />
                  <span className="text-sm font-medium">Salvamentos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.saves.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plataformas */}
        {idea.platforms && idea.platforms.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plataformas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {idea.platforms.map((platform) => {
                const Icon = platformIcons[platform.platform]
                const latestMetric = platform.metrics?.[0]

                return (
                  <div key={platform.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">{platform.platform}</h3>
                        <p className="text-sm text-gray-600">
                          {platform.is_posted ? 'Postado' : 'Não postado'}
                        </p>
                      </div>
                    </div>

                    {latestMetric && (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Views</p>
                          <p className="font-semibold">{latestMetric.views.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Likes</p>
                          <p className="font-semibold">{latestMetric.likes.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Eng. Rate</p>
                          <p className="font-semibold">{latestMetric.engagement_rate.toFixed(2)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div className="grid grid-cols-1 gap-6">
          {/* Roteiro */}
          {idea.script && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Roteiro</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{idea.script}</p>
            </div>
          )}

          {/* Instruções para Editor */}
          {idea.editor_instructions && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Instruções para o Editor</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{idea.editor_instructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
