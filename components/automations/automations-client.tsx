'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Clock, CheckCircle2, XCircle, Loader2, Activity, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AutomationSettings {
  auto_sync_enabled: boolean
  sync_frequency: string
  updated_at: string
}

interface SyncHistoryItem {
  id: string
  sync_type: 'manual' | 'auto'
  sync_source: string
  status: 'success' | 'error' | 'in_progress'
  new_posts: number
  updated_posts: number
  error_message?: string
  created_at: string
  duration_ms?: number
}

export default function AutomationsClient() {
  const [settings, setSettings] = useState<AutomationSettings | null>(null)
  const [history, setHistory] = useState<SyncHistoryItem[]>([])
  const [lastSuccess, setLastSuccess] = useState<SyncHistoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [togglingAutoSync, setTogglingAutoSync] = useState(false)

  // Buscar configurações e histórico
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [settingsRes, historyRes] = await Promise.all([
        fetch('/api/automations/settings'),
        fetch('/api/automations/history?limit=10')
      ])

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData.history || [])
        setLastSuccess(historyData.lastSuccess)
      }
    } catch (error) {
      console.error('Error fetching automation data:', error)
      toast.error('Erro ao carregar dados de automação')
    } finally {
      setLoading(false)
    }
  }

  // Toggle auto-sync
  const handleToggleAutoSync = async () => {
    if (!settings) return

    setTogglingAutoSync(true)
    const newValue = !settings.auto_sync_enabled

    try {
      const response = await fetch('/api/automations/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auto_sync_enabled: newValue,
          sync_frequency: settings.sync_frequency
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        toast.success(
          newValue
            ? 'Sincronização automática ativada'
            : 'Sincronização automática desativada'
        )
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error toggling auto-sync:', error)
      toast.error('Erro ao atualizar configuração')
    } finally {
      setTogglingAutoSync(false)
    }
  }

  // Sincronizar agora
  const handleSyncNow = async () => {
    setSyncing(true)

    try {
      const response = await fetch('/api/automations/sync-now', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(
          `Sincronização concluída! ${data.new_posts} novos posts, ${data.updated_posts} atualizados`
        )
        // Recarregar dados
        await fetchData()
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error: any) {
      console.error('Error syncing:', error)
      toast.error(error.message || 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Card: Auto-sync Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Sincronização Automática
            </h2>
            <p className="text-sm text-gray-600">
              Sincronize posts do Instagram automaticamente todos os dias
            </p>
          </div>

          <button
            onClick={handleToggleAutoSync}
            disabled={togglingAutoSync}
            className={`
              relative inline-flex h-8 w-14 items-center rounded-full transition-colors
              ${settings?.auto_sync_enabled ? 'bg-green-500' : 'bg-gray-300'}
              ${togglingAutoSync ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                ${settings?.auto_sync_enabled ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {settings?.auto_sync_enabled && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">
              ✅ Sincronização automática está <strong>ativa</strong>. Seus posts do Instagram serão atualizados automaticamente.
            </p>
          </div>
        )}
      </div>

      {/* Card: Última Sincronização */}
      {lastSuccess && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Última Sincronização
              </h2>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(lastSuccess.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Sucesso</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Novos Posts</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{lastSuccess.new_posts}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">Atualizados</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{lastSuccess.updated_posts}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card: Sincronizar Agora */}
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Sincronização Manual
            </h2>
            <p className="text-sm text-gray-600">
              Atualize seus posts do Instagram agora mesmo
            </p>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {syncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Sincronizar Agora
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card: Histórico */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Histórico de Sincronizações
          </h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma sincronização registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  <div>
                    {item.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {item.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    {item.status === 'in_progress' && (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {item.sync_type === 'manual' ? 'Sincronização Manual' : 'Sincronização Automática'}
                      </span>
                      {item.sync_type === 'auto' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Auto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                      {item.duration_ms && ` • ${(item.duration_ms / 1000).toFixed(1)}s`}
                    </p>
                    {item.error_message && (
                      <p className="text-xs text-red-600 mt-1">{item.error_message}</p>
                    )}
                  </div>

                  {/* Stats */}
                  {item.status === 'success' && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>+{item.new_posts} novos</span>
                      <span>↻{item.updated_posts} atualizados</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
