'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Instagram, RefreshCw, LogOut, Users, UserPlus, FileImage, Loader2 } from 'lucide-react'

interface InstagramAccountProps {
  account: {
    id: string
    username: string
    followers_count: number
    follows_count: number
    media_count: number
    profile_picture_url: string | null
    last_sync_at: string | null
  }
  onDisconnect: () => void
}

export default function InstagramAccount({ account, onDisconnect }: InstagramAccountProps) {
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/instagram/sync', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erro ao sincronizar')
      }

      alert('Sincronização concluída com sucesso!')
      window.location.reload()
    } catch (error) {
      console.error('Error syncing:', error)
      alert('Erro ao sincronizar conta')
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

      if (!response.ok) {
        throw new Error('Erro ao desconectar')
      }

      onDisconnect()
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert('Erro ao desconectar conta')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {account.profile_picture_url ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={account.profile_picture_url}
                  alt={account.username}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white shadow-lg flex items-center justify-center">
                <Instagram className="w-10 h-10" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold mb-1">@{account.username}</h2>
              <p className="text-white/80">Conta conectada</p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {disconnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Desconectando...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Desconectar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-200">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {account.followers_count.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">Seguidores</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {account.follows_count.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">Seguindo</p>
        </div>
        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileImage className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {account.media_count.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">Posts</p>
        </div>
      </div>

      {/* Sync Info */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Sincronização</h3>
            {account.last_sync_at ? (
              <p className="text-sm text-gray-600">
                Última sincronização: {format(new Date(account.last_sync_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            ) : (
              <p className="text-sm text-gray-600">Nenhuma sincronização realizada</p>
            )}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {syncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Sincronizar agora
              </>
            )}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            A sincronização importa as métricas dos seus posts mais recentes do Instagram.
            As métricas são atualizadas automaticamente a cada 24 horas.
          </p>
        </div>
      </div>
    </div>
  )
}
