'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function RefreshMetricsButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setLoading(true)

    try {
      // Buscar todas as ideias posted do usuario
      const ideasResponse = await fetch('/api/ideas')
      if (!ideasResponse.ok) throw new Error('Erro ao buscar ideias')

      const ideas = await ideasResponse.json()

      // Filtrar ideias que estao postadas
      const postedIdeas = ideas.filter((idea: any) => idea.status === 'posted')

      if (postedIdeas.length === 0) {
        toast('Nenhuma ideia postada para sincronizar', { icon: 'ℹ️' })
        setLoading(false)
        return
      }

      toast.loading('Sincronizando metricas...', { id: 'sync-metrics' })

      let totalSynced = 0
      let totalErrors = 0

      // Sincronizar cada ideia
      for (const idea of postedIdeas) {
        try {
          const response = await fetch(`/api/ideas/${idea.id}/sync-metrics`, {
            method: 'POST',
          })

          if (response.ok) {
            const data = await response.json()
            totalSynced += data.platforms_synced || 0
            totalErrors += data.platforms_errors || 0
          }
        } catch (error) {
          console.error(`Erro ao sincronizar ideia ${idea.id}:`, error)
          totalErrors++
        }
      }

      toast.dismiss('sync-metrics')

      if (totalErrors > 0) {
        toast.success(
          `${totalSynced} metricas atualizadas (${totalErrors} erros)`,
          { duration: 5000 }
        )
      } else {
        toast.success(`${totalSynced} metricas atualizadas com sucesso!`, {
          duration: 5000,
        })
      }

      // Refresh da pagina para mostrar novos dados
      router.refresh()
    } catch (error: any) {
      toast.dismiss('sync-metrics')
      toast.error('Erro ao sincronizar metricas: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      title="Atualizar metricas do Instagram"
    >
      <RefreshCw
        className={`w-4 h-4 text-gray-600 group-hover:text-primary transition-colors ${
          loading ? 'animate-spin' : ''
        }`}
      />
      <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
        {loading ? 'Atualizando...' : 'Atualizar Metricas'}
      </span>
    </button>
  )
}
