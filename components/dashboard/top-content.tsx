'use client'

import { m } from 'framer-motion'
import { Trophy, Eye, Heart, TrendingUp, Play } from 'lucide-react'
import Link from 'next/link'

interface TopContentProps {
  ideas: any[]
}

export default function TopContent({ ideas }: TopContentProps) {
  // Ordenar por visualizações
  const sortedIdeas = [...ideas].sort((a, b) => {
    const aViews = a.idea_platforms?.[0]?.metrics?.[0]?.views || 0
    const bViews = b.idea_platforms?.[0]?.metrics?.[0]?.views || 0
    return bViews - aViews
  })

  const topIdeas = sortedIdeas.slice(0, 5)

  if (!topIdeas || topIdeas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Top Conteúdos</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          Nenhum conteúdo disponível ainda
        </p>
      </div>
    )
  }

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600' // Ouro
      case 1:
        return 'from-gray-300 to-gray-500' // Prata
      case 2:
        return 'from-orange-400 to-orange-600' // Bronze
      default:
        return 'from-gray-200 to-gray-400'
    }
  }

  return (
    <m.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow"
      data-tour="top-content"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Top Conteúdos</h3>
          <p className="text-xs text-gray-600">Seus melhores posts</p>
        </div>
      </div>

      <div className="space-y-3">
        {topIdeas.map((idea, index) => {
          const metrics = idea.idea_platforms?.[0]?.metrics?.[0]
          const views = metrics?.views || 0
          const likes = metrics?.likes || 0

          return (
            <Link key={idea.id} href={`/dashboard/ideas/${idea.id}`}>
              <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all cursor-pointer"
              >
                  {/* Medal/Position */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${getMedalColor(
                      index
                    )} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                  >
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                    {idea.thumbnail_url ? (
                      <img
                        src={idea.thumbnail_url}
                        alt={idea.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate group-hover:text-primary transition-colors">
                      {idea.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Eye className="w-3 h-3" />
                        <span>{views.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Heart className="w-3 h-3" />
                        <span>{likes.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trending Arrow */}
                  <TrendingUp className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </m.div>
            </Link>
          )
        })}
      </div>

      <Link href="/dashboard/ideas">
        <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-purple-50 rounded-lg transition-colors font-medium">
          Ver todos os conteúdos →
        </button>
      </Link>
    </m.div>
  )
}
