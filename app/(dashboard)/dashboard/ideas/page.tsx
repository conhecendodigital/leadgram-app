'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Filter } from 'lucide-react'
import IdeaCard from '@/components/ideas/idea-card'
import type { Idea, IdeaStatus, FunnelStage } from '@/types/idea.types'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all')
  const [funnelFilter, setFunnelFilter] = useState<FunnelStage | 'all'>('all')

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setIdeas(data)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIdeas = ideas.filter((idea) => {
    if (statusFilter !== 'all' && idea.status !== statusFilter) return false
    if (funnelFilter !== 'all' && idea.funnel_stage !== funnelFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Ideias</h1>
            <p className="text-gray-600 mt-1">
              {filteredIdeas.length} {filteredIdeas.length === 1 ? 'ideia' : 'ideias'} encontrada{filteredIdeas.length !== 1 && 's'}
            </p>
          </div>
          <Link
            href="/dashboard/ideas/new"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nova Ideia
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os status</option>
              <option value="idea">Ideia</option>
              <option value="recorded">Gravado</option>
              <option value="posted">Postado</option>
            </select>

            {/* Funnel Filter */}
            <select
              value={funnelFilter}
              onChange={(e) => setFunnelFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os funis</option>
              <option value="top">Topo</option>
              <option value="middle">Meio</option>
              <option value="bottom">Fundo</option>
            </select>

            {(statusFilter !== 'all' || funnelFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setFunnelFilter('all')
                }}
                className="text-sm text-primary hover:opacity-90 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Grid de Ideias */}
        {filteredIdeas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">
              {ideas.length === 0
                ? 'Você ainda não tem ideias cadastradas'
                : 'Nenhuma ideia encontrada com os filtros selecionados'}
            </p>
            {ideas.length === 0 && (
              <Link
                href="/dashboard/ideas/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Criar primeira ideia
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
