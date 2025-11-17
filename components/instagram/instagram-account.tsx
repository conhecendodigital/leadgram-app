'use client'

import NextImage from 'next/image'
import { Instagram, Users, Image, Calendar, RefreshCw, XCircle, Loader, AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/lib/toast'

interface InstagramAccountProps {
  account: {
    id: string
    username: string
    profile_picture_url: string | null
    followers_count: number | null
    follows_count: number | null
    media_count: number | null
    connected_at: string
    last_sync_at: string | null
  }
}

export default function InstagramAccount({ account }: InstagramAccountProps) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [needsReconnect, setNeedsReconnect] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    setSyncError(null)
    setNeedsReconnect(false)
    const loadingToast = showToast.loading('Sincronizando Instagram...')

    try {
      const response = await fetch('/api/instagram/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Verificar se precisa reconectar
        if (data.error?.includes('expirado') || data.error?.includes('inválido') || data.error?.includes('reconecte')) {
          setNeedsReconnect(true)
        }
        setSyncError(data.error || 'Erro ao sincronizar')
        throw new Error(data.error || 'Erro ao sincronizar')
      }

      // Sucesso
      showToast.success(
        `✅ Sincronizado! ${data.newPosts || 0} novos posts importados`,
        { id: loadingToast }
      )

      setSyncError(null)
      setNeedsReconnect(false)

      // Refresh da página para mostrar dados atualizados
      router.refresh()
    } catch (error: any) {
      console.error('Sync error:', error)
      showToast.error(
        `❌ ${error.message || 'Erro ao sincronizar. Tente novamente.'}`,
        { id: loadingToast }
      )
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setShowDisconnectModal(false)
    setDisconnecting(true)

    try {
      const response = await fetch('/api/instagram/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erro ao desconectar')
      }

      showToast.success('Instagram desconectado com sucesso!')
      router.refresh()
    } catch (error) {
      console.error('Disconnect error:', error)
      showToast.error('Erro ao desconectar. Tente novamente.')
    } finally {
      setDisconnecting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          {account.profile_picture_url ? (
            <div className="relative w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden">
              <NextImage
                src={account.profile_picture_url}
                alt={account.username}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
              <Instagram className="w-8 h-8 text-white" />
            </div>
          )}

          {/* Account Info */}
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
              @{account.username}
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                Conectado
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Conectado em {formatDate(account.connected_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Sincronizando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Sincronizar</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowDisconnectModal(true)}
            disabled={disconnecting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disconnecting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Desconectando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Desconectar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {syncError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Erro ao Sincronizar</p>
              <p className="text-sm text-red-700">{syncError}</p>
              {needsReconnect && (
                <button
                  onClick={handleDisconnect}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reconectar Instagram
                </button>
              )}
            </div>
            <button
              onClick={() => setSyncError(null)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Seguidores</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {account.followers_count?.toLocaleString('pt-BR') || '0'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Seguindo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {account.follows_count?.toLocaleString('pt-BR') || '0'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">Posts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {account.media_count?.toLocaleString('pt-BR') || '0'}
          </p>
        </div>
      </div>

      {/* Last Sync */}
      {account.last_sync_at && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          Última sincronização: {formatDate(account.last_sync_at)}
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Desconectar Instagram
                </h3>
              </div>
              <button
                onClick={() => setShowDisconnectModal(false)}
                disabled={disconnecting}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Tem certeza que deseja desconectar sua conta <strong>@{account.username}</strong>?
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Atenção:</strong> Seus posts e métricas importadas não serão excluídos, mas você não poderá mais sincronizar novos dados até reconectar.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisconnectModal(false)}
                disabled={disconnecting}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {disconnecting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Desconectando...
                  </>
                ) : (
                  'Desconectar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
