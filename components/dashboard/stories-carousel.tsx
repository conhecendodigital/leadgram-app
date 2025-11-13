'use client'

import { m } from 'framer-motion'
import { Plus, Lightbulb, Video, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface StoriesCarouselProps {
  ideas: any[]
}

export default function StoriesCarousel({ ideas }: StoriesCarouselProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return CheckCircle
      case 'recorded':
        return Video
      default:
        return Lightbulb
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'from-green-500 to-emerald-500'
      case 'recorded':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-yellow-500 to-orange-500'
    }
  }

  return (
    <div className="mt-6" data-tour="stories">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Suas Ideias 💡
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Add New Story */}
        <Link href="/dashboard/ideas/new">
          <m.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer group hover:shadow-xl transition-all">
              <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-gray-300 group-hover:border-gray-400 transition-colors" />
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <p className="text-xs text-center mt-2 text-gray-600 font-medium">Nova</p>
          </m.div>
        </Link>

        {/* Ideas as Stories */}
        {ideas.map((idea, index) => {
          const StatusIcon = getStatusIcon(idea.status)
          const statusColor = getStatusColor(idea.status)

          return (
            <Link key={idea.id} href={`/dashboard/ideas/${idea.id}`}>
              <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group">
                  {/* Gradient Border */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${statusColor} p-[3px] rounded-2xl`}>
                    <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                      {idea.thumbnail_url ? (
                        <img
                          src={idea.thumbnail_url}
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${statusColor} flex items-center justify-center`}>
                          <StatusIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <StatusIcon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <p className="text-xs text-center mt-2 text-gray-900 font-medium truncate w-24">
                  {idea.title}
                </p>
              </m.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
