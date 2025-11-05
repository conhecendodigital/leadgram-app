'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Lightbulb } from 'lucide-react'
import StatusBadge from '@/components/ideas/status-badge'
import FunnelBadge from '@/components/ideas/funnel-badge'
import type { Idea } from '@/types/idea.types'

export default function RecentIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
          .from('ideas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (data) {
          setIdeas(data)
        }
      } catch (error) {
        console.error('Error fetching recent ideas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (ideas.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ideias Recentes</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Você ainda não tem ideias cadastradas</p>
          <Link
            href="/dashboard/ideas/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:opacity-90 hover:shadow-lg transition-all duration-200"
          >
            Criar primeira ideia
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ideias Recentes</h3>
        <Link
          href="/dashboard/ideas"
          className="text-sm font-medium text-primary hover:opacity-90 flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {ideas.map((idea) => (
          <Link
            key={idea.id}
            href={`/dashboard/ideas/${idea.id}`}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {idea.title}
                </h4>
                <StatusBadge status={idea.status} />
                <FunnelBadge stage={idea.funnel_stage} />
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(idea.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
