'use client'

import { m } from 'framer-motion'
import { Eye, Heart, MessageCircle, Play } from 'lucide-react'
import Link from 'next/link'

interface ContentGridProps {
  ideas: any[]
}

export default function ContentGrid({ ideas }: ContentGridProps) {
  if (!ideas || ideas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center" data-tour="content-grid">
        <p className="text-gray-500">Nenhum conteúdo postado ainda</p>
        <Link
          href="/dashboard/ideas/new"
          className="inline-block mt-4 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          Criar Primeira Ideia
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" data-tour="content-grid">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Seus Posts</h3>
        <Link
          href="/dashboard/ideas"
          className="text-sm font-medium text-primary hover:opacity-90"
        >
          Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-1">
        {ideas.map((idea, index) => {
          const metrics = idea.idea_platforms?.[0]?.metrics?.[0]
          const views = metrics?.views || 0
          const likes = metrics?.likes || 0
          const comments = metrics?.comments || 0

          return (
            <Link key={idea.id} href={`/dashboard/ideas/${idea.id}`}>
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
              >
                {/* Thumbnail ou Gradient */}
                {idea.thumbnail_url ? (
                  <img
                    src={idea.thumbnail_url}
                    alt={idea.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-80" />
                  </div>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center space-y-2">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-5 h-5 fill-white" />
                        <span className="font-semibold">
                          {likes.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-5 h-5 fill-white" />
                        <span className="font-semibold">
                          {comments.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{views.toLocaleString('pt-BR')} views</span>
                    </div>
                  </div>
                </div>
              </m.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
