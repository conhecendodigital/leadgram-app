'use client'

import { Instagram, Users, Image, Calendar, RefreshCw, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/instagram/sync', {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Erro ao sincronizar. Tente novamente.')
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Erro ao sincronizar. Tente novamente.')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Instagram?')) {
      return
    }

    setDisconnecting(true)
    try {
      const response = await fetch('/api/instagram/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Erro ao desconectar. Tente novamente.')
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      alert('Erro ao desconectar. Tente novamente.')
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
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          {account.profile_picture_url ? (
            <img
              src={account.profile_picture_url}
              alt={account.username}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
              <Instagram className="w-8 h-8 text-white" />
            </div>
          )}

          {/* Account Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              @{account.username}
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                Conectado
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Conectado em {formatDate(account.connected_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            {disconnecting ? 'Desconectando...' : 'Desconectar'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
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
    </div>
  )
}
