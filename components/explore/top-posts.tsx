'use client'

import { useState, useMemo } from 'react'
import { Heart, MessageCircle, TrendingUp, Play, Image as ImageIcon } from 'lucide-react'

interface TopPostsProps {
  posts: any[]
}

type FilterType = 'engagement' | 'likes' | 'comments' | 'recent'

export default function TopPosts({ posts }: TopPostsProps) {
  const [filter, setFilter] = useState<FilterType>('engagement')

  // Filtrar e ordenar posts
  const filteredPosts = useMemo(() => {
    let sorted = [...posts]

    switch (filter) {
      case 'engagement':
        sorted.sort((a, b) => b.engagement_rate - a.engagement_rate)
        break
      case 'likes':
        sorted.sort((a, b) => b.like_count - a.like_count)
        break
      case 'comments':
        sorted.sort((a, b) => b.comment_count - a.comment_count)
        break
      case 'recent':
        sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        break
    }

    return sorted.slice(0, 20) // Top 20
  }, [posts, filter])

  const filters = [
    { value: 'engagement', label: 'Maior Engajamento', icon: TrendingUp },
    { value: 'likes', label: 'Mais Curtidas', icon: Heart },
    { value: 'comments', label: 'Mais Comentários', icon: MessageCircle },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as FilterType)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm md:text-base
              ${filter === f.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            <f.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredPosts.map((post, index) => (
          <div
            key={post.id}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
          >
            {/* Post Image/Video */}
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700">
              {post.media_url ? (
                <img
                  src={post.media_url}
                  alt={post.caption?.slice(0, 50) || 'Post'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Media Type Badge */}
            {post.media_type === 'VIDEO' && (
              <div className="absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 bg-black/60 backdrop-blur-sm rounded-lg">
                <Play className="w-3 h-3 md:w-4 md:h-4 text-white" fill="white" />
              </div>
            )}

            {/* Rank Badge */}
            {index < 3 && (
              <div className={`
                absolute top-2 md:top-3 left-2 md:left-3 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-white text-xs md:text-sm shadow-lg
                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                  'bg-gradient-to-br from-orange-400 to-orange-600'}
              `}>
                {index + 1}
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 md:p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 md:gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 fill-white" />
                    <span className="font-semibold text-xs md:text-sm">
                      {post.like_count.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 fill-white" />
                    <span className="font-semibold text-xs md:text-sm">
                      {post.comment_count.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-white text-xs md:text-sm">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-semibold">{post.engagement_rate}%</span>
                  <span className="text-white/80 hidden sm:inline">engajamento</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No posts */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum post encontrado
          </p>
        </div>
      )}
    </div>
  )
}
