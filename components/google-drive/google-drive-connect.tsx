'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudOff, Loader2 } from 'lucide-react'

interface GoogleDriveConnection {
  id: string
  email: string
  folder_id: string | null
  is_active: boolean
  created_at: string
}

export default function GoogleDriveConnect() {
  const [connection, setConnection] = useState<GoogleDriveConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/google-drive/status')
      const data = await response.json()

      if (data.connected) {
        setConnection(data.connection)
      } else {
        setConnection(null)
      }
    } catch (error) {
      console.error('Error checking Google Drive connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/google-drive/auth'
  }

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar o Google Drive? Seus vídeos permanecerão no Drive, mas você não poderá fazer novos uploads.')) {
      return
    }

    try {
      setDisconnecting(true)
      const response = await fetch('/api/google-drive/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        setConnection(null)
      } else {
        alert('Erro ao desconectar Google Drive. Tente novamente.')
      }
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error)
      alert('Erro ao desconectar Google Drive. Tente novamente.')
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando conexão...</span>
      </div>
    )
  }

  if (connection) {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
        <Cloud className="h-6 w-6 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">
            Google Drive Conectado
          </p>
          <p className="text-xs text-green-700">{connection.email}</p>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {disconnecting ? (
            <>
              <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
              Desconectando...
            </>
          ) : (
            'Desconectar'
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <CloudOff className="h-6 w-6 text-gray-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          Google Drive não conectado
        </p>
        <p className="text-xs text-gray-600">
          Conecte sua conta para salvar vídeos diretamente no Drive
        </p>
      </div>
      <button
        onClick={handleConnect}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Conectar Google Drive
      </button>
    </div>
  )
}
