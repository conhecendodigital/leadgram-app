'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, Video, Lightbulb, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ActivityFeedProps {
  ideas: any[]
}

export default function ActivityFeed({ ideas }: ActivityFeedProps) {
  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return CheckCircle
      case 'recorded':
        return Video
      default:
        return Lightbulb
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'from-green-500 to-emerald-500'
      case 'recorded':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-yellow-500 to-orange-500'
    }
  }

  const getActivityText = (idea: any) => {
    switch (idea.status) {
      case 'posted':
        return `"${idea.title}" foi publicado`
      case 'recorded':
        return `"${idea.title}" foi gravado`
      default:
        return `Nova ideia: "${idea.title}"`
    }
  }

  if (!ideas || ideas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Atividades Recentes</h3>
            <p className="text-xs text-gray-600">Suas últimas ações</p>
          </div>
        </div>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nenhuma atividade ainda</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Atividades Recentes</h3>
          <p className="text-xs text-gray-600">Suas últimas ações</p>
        </div>
      </div>

      <div className="space-y-4">
        {ideas.map((idea, index) => {
          const ActivityIcon = getActivityIcon(idea.status)
          const colorGradient = getActivityColor(idea.status)
          const activityText = getActivityText(idea)

          return (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 group"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <ActivityIcon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activityText}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(idea.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <Link href="/dashboard/ideas">
        <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-purple-50 rounded-lg transition-colors font-medium">
          Ver tudo
        </button>
      </Link>
    </motion.div>
  )
}
