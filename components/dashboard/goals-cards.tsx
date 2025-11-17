'use client'

import { useMemo } from 'react'
import { m } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  Eye,
  Heart,
  MessageCircle,
  CheckCircle2
} from 'lucide-react'

interface GoalsCardsProps {
  ideas: any[]
  stats: {
    totalViews: number
    totalLikes: number
    totalComments: number
    engagementRate: string
  }
}

type Goal = {
  id: string
  title: string
  description: string
  icon: any
  current: number
  target: number
  unit: string
  color: string
  gradient: string
}

export default function GoalsCards({ ideas, stats }: GoalsCardsProps) {
  // Calcular métricas para as metas
  const postedIdeas = useMemo(() => {
    return ideas.filter((i: any) => i.status === 'posted')
  }, [ideas])

  const thisWeekPosts = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return postedIdeas.filter((i: any) => new Date(i.created_at) >= sevenDaysAgo).length
  }, [postedIdeas])

  const thisMonthPosts = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return postedIdeas.filter((i: any) => new Date(i.created_at) >= thirtyDaysAgo).length
  }, [postedIdeas])

  // Definir metas
  const goals: Goal[] = useMemo(() => [
    {
      id: 'views',
      title: 'Meta de Visualizações',
      description: 'Alcance 10.000 visualizações',
      icon: Eye,
      current: stats.totalViews,
      target: 10000,
      unit: 'views',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'engagement',
      title: 'Taxa de Engajamento',
      description: 'Mantenha acima de 5%',
      icon: Heart,
      current: parseFloat(stats.engagementRate),
      target: 5,
      unit: '%',
      color: 'text-pink-600',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'weekly-posts',
      title: 'Posts Semanais',
      description: 'Poste 3 vezes por semana',
      icon: Calendar,
      current: thisWeekPosts,
      target: 3,
      unit: 'posts',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'monthly-posts',
      title: 'Posts Mensais',
      description: 'Mantenha 12 posts por mês',
      icon: TrendingUp,
      current: thisMonthPosts,
      target: 12,
      unit: 'posts',
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500'
    }
  ], [stats, thisWeekPosts, thisMonthPosts])

  // Calcular progresso geral
  const overallProgress = useMemo(() => {
    const completedGoals = goals.filter(g => g.current >= g.target).length
    return Math.round((completedGoals / goals.length) * 100)
  }, [goals])

  // Formatador de números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  if (postedIdeas.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Metas e Objetivos</h3>
            <p className="text-sm text-gray-500">Acompanhe seu progresso</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Poste conteúdos para começar a</p>
          <p className="text-sm text-gray-500">acompanhar suas metas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Metas e Objetivos</h3>
            <p className="text-sm text-gray-500">
              {goals.filter(g => g.current >= g.target).length} de {goals.length} completadas
            </p>
          </div>
        </div>

        {/* Badge de progresso geral */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">{overallProgress}%</p>
            <p className="text-xs text-gray-500">Completo</p>
          </div>
          {overallProgress === 100 && (
            <Award className="w-6 h-6 text-amber-500" />
          )}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100)
          const isCompleted = goal.current >= goal.target

          return (
            <m.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Goal Card */}
              <div className={`
                p-4 rounded-xl border-2 transition-all
                ${isCompleted
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
                }
              `}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      bg-gradient-to-br ${goal.gradient}
                    `}>
                      <goal.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {goal.title}
                        </h4>
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{goal.description}</p>
                    </div>
                  </div>

                  {/* Valor atual */}
                  <div className="text-right ml-2">
                    <p className={`text-lg font-bold ${goal.color}`}>
                      {goal.unit === '%'
                        ? goal.current.toFixed(1)
                        : formatNumber(goal.current)
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      de {goal.unit === '%' ? goal.target : formatNumber(goal.target)} {goal.unit}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`
                      absolute inset-y-0 left-0 rounded-full
                      bg-gradient-to-r ${goal.gradient}
                    `}
                  />
                </div>

                {/* Progress Text */}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs font-medium text-gray-600">
                    {progress.toFixed(0)}% completo
                  </p>
                  {!isCompleted && progress > 0 && (
                    <p className="text-xs text-gray-500">
                      Faltam {goal.unit === '%'
                        ? (goal.target - goal.current).toFixed(1)
                        : formatNumber(goal.target - goal.current)
                      } {goal.unit}
                    </p>
                  )}
                  {isCompleted && (
                    <p className="text-xs font-semibold text-green-600">
                      Meta atingida! 🎉
                    </p>
                  )}
                </div>
              </div>
            </m.div>
          )
        })}
      </div>

      {/* Achievement Badge */}
      {overallProgress === 100 && (
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-center"
        >
          <Award className="w-8 h-8 text-white mx-auto mb-2" />
          <p className="text-white font-bold text-sm">Parabéns! Todas as metas foram atingidas! 🏆</p>
          <p className="text-amber-100 text-xs mt-1">Continue assim para manter o excelente desempenho</p>
        </m.div>
      )}
    </div>
  )
}
