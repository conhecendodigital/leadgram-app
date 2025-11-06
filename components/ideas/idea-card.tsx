import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import StatusBadge from './status-badge'
import FunnelBadge from './funnel-badge'
import type { Idea } from '@/types/idea.types'

interface IdeaCardProps {
  idea: Idea
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  // Calcular métricas totais de todas as plataformas
  const totalMetrics = idea.platforms?.reduce(
    (acc, platform) => {
      const latestMetric = platform.metrics?.[0]
      if (latestMetric) {
        return {
          views: acc.views + latestMetric.views,
          likes: acc.likes + latestMetric.likes,
          comments: acc.comments + latestMetric.comments,
          shares: acc.shares + latestMetric.shares,
        }
      }
      return acc
    },
    { views: 0, likes: 0, comments: 0, shares: 0 }
  )

  return (
    <Link
      href={`/dashboard/ideas/${idea.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {/* Thumbnail */}
      {idea.thumbnail_url && (
        <div className="relative h-48 bg-gray-100">
          <Image
            src={idea.thumbnail_url}
            alt={idea.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header com badges */}
        <div className="flex items-start gap-2 mb-3 flex-wrap">
          <StatusBadge status={idea.status} />
          <FunnelBadge stage={idea.funnel_stage} />
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {idea.title}
        </h3>

        {/* Tema */}
        {idea.theme && (
          <p className="text-sm text-gray-600 mb-3">{idea.theme}</p>
        )}

        {/* Métricas */}
        {totalMetrics && (totalMetrics.views > 0 || totalMetrics.likes > 0) && (
          <div className="grid grid-cols-4 gap-2 mb-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">
                {totalMetrics.views > 0 ? totalMetrics.views.toLocaleString('pt-BR') : '-'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">
                {totalMetrics.likes > 0 ? totalMetrics.likes.toLocaleString('pt-BR') : '-'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                {totalMetrics.comments > 0 ? totalMetrics.comments.toLocaleString('pt-BR') : '-'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-medium">
                {totalMetrics.shares > 0 ? totalMetrics.shares.toLocaleString('pt-BR') : '-'}
              </span>
            </div>
          </div>
        )}

        {/* Data */}
        <p className="text-xs text-gray-500">
          Criado em {format(new Date(idea.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>
    </Link>
  )
}
