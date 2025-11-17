'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Filter, Search, X } from 'lucide-react'
import IdeaCard from '@/components/ideas/idea-card'
import GoogleDriveConnect from '@/components/google-drive/google-drive-connect'
import type { Idea, IdeaStatus, FunnelStage } from '@/types/idea.types'

type SortOption = 'newest' | 'oldest' | 'most-views' | 'title-asc'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all')
  const [funnelFilter, setFunnelFilter] = useState<FunnelStage | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [itemsToShow, setItemsToShow] = useState(20)

  useEffect(() => {
    fetchIdeas()
  }, [])

  // FIX #2: Resetar paginação quando filtros mudam
  useEffect(() => {
    setItemsToShow(20)
  }, [searchQuery, statusFilter, funnelFilter, sortBy])

  const fetchIdeas = async () => {
    try {
      setError(null)
      setLoading(true) // FIX #3: Mostrar loading ao retry
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      const { data, error: fetchError } = await supabase
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

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (data) {
        setIdeas(data)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar ideias. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // FIX #1: useMemo para performance (evita re-filtrar/re-ordenar a cada render)
  const filteredAndSortedIdeas = useMemo(() => {
    return ideas
      .filter((idea) => {
        // Filtro de busca (título, tema, script)
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesTitle = idea.title?.toLowerCase().includes(query)
          const matchesTheme = idea.theme?.toLowerCase().includes(query)
          const matchesScript = idea.script?.toLowerCase().includes(query)

          if (!matchesTitle && !matchesTheme && !matchesScript) {
            return false
          }
        }

        // Filtro de status
        if (statusFilter !== 'all' && idea.status !== statusFilter) return false

        // Filtro de funil
        if (funnelFilter !== 'all' && idea.funnel_stage !== funnelFilter) return false

        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case 'most-views': {
            const aViews = a.platforms?.reduce((sum, p) => sum + (p.metrics?.[0]?.views || 0), 0) || 0
            const bViews = b.platforms?.reduce((sum, p) => sum + (p.metrics?.[0]?.views || 0), 0) || 0
            return bViews - aViews
          }
          case 'title-asc':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
  }, [ideas, searchQuery, statusFilter, funnelFilter, sortBy])

  const paginatedIdeas = filteredAndSortedIdeas.slice(0, itemsToShow)
  const hasMore = filteredAndSortedIdeas.length > itemsToShow

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || funnelFilter !== 'all'

  const clearAllFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setFunnelFilter('all')
  }

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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">!</div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar ideias</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={fetchIdeas}
                className="text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Minhas Ideias</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {filteredAndSortedIdeas.length} {filteredAndSortedIdeas.length === 1 ? 'ideia' : 'ideias'} encontrada{filteredAndSortedIdeas.length !== 1 && 's'}
            </p>
          </div>
          <Link
            href="/dashboard/ideas/new"
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Nova Ideia
          </Link>
        </div>

        {/* Google Drive Connection */}
        <div className="mb-6">
          <GoogleDriveConnect />
        </div>

        {/* Busca e Filtros */}
        <div className="space-y-4 mb-6">
          {/* Barra de Busca */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ideias por título, tema ou roteiro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos os funis</option>
                <option value="top">Topo</option>
                <option value="middle">Meio</option>
                <option value="bottom">Fundo</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Mais recente</option>
                <option value="oldest">Mais antigo</option>
                <option value="most-views">Mais visualizado</option>
                <option value="title-asc">Título (A-Z)</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary hover:opacity-90 font-medium whitespace-nowrap"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            {/* Filtros Ativos Badge */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Filtros ativos:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Busca: "{searchQuery.substring(0, 20)}{searchQuery.length > 20 ? '...' : ''}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Status: {statusFilter === 'idea' ? 'Ideia' : statusFilter === 'recorded' ? 'Gravado' : 'Postado'}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {funnelFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Funil: {funnelFilter === 'top' ? 'Topo' : funnelFilter === 'middle' ? 'Meio' : 'Fundo'}
                    <button
                      onClick={() => setFunnelFilter('all')}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Grid de Ideias */}
        {filteredAndSortedIdeas.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setItemsToShow(prev => prev + 20)}
                  className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-primary hover:text-primary transition-all"
                >
                  Carregar mais ({filteredAndSortedIdeas.length - itemsToShow} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
