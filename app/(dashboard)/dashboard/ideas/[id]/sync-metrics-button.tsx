'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface SyncMetricsButtonProps {
  ideaId: string
}

export default function SyncMetricsButton({ ideaId }: SyncMetricsButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setStatus('idle')
    setError(null)

    try {
      const response = await fetch(`/api/ideas/${ideaId}/sync-metrics`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao sincronizar métricas')
      }

      setStatus('success')
      router.refresh()

      // Voltar ao estado idle após 3 segundos
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Error syncing metrics:', error)
      setError(error instanceof Error ? error.message : 'Erro ao sincronizar métricas')
      setStatus('error')

      // Voltar ao estado idle após 5 segundos
      setTimeout(() => {
        setStatus('idle')
        setError(null)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          status === 'success'
            ? 'bg-green-50 text-green-600'
            : status === 'error'
            ? 'bg-red-50 text-red-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Sincronizando...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Sincronizado!
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4" />
            Erro
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>
      )}
    </div>
  )
}
