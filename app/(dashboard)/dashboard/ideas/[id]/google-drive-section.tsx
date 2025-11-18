'use client'

import { useEffect, useState } from 'react'
import { Video, Folder, ExternalLink, RefreshCw, Trash2 } from 'lucide-react'
import VideoUpload from '@/components/google-drive/video-upload'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GoogleDriveSectionProps {
  ideaId: string
  ideaTitle: string
  driveFolderId: string | null
  driveVideoIds: any[]
}

export default function GoogleDriveSection({ ideaId, ideaTitle, driveFolderId, driveVideoIds: initialVideos }: GoogleDriveSectionProps) {
  const [driveVideos, setDriveVideos] = useState(initialVideos || [])
  const [isLoading, setIsLoading] = useState(false)
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)

  // Busca vídeos diretamente do Google Drive
  const fetchVideos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/google-drive/list-videos?ideaId=${ideaId}`)
      if (response.ok) {
        const data = await response.json()
        setDriveVideos(data.videos || [])
      } else {
        console.error('Failed to fetch videos from Drive')
        // Mantém os vídeos locais se falhar
        setDriveVideos(initialVideos || [])
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      // Mantém os vídeos locais se falhar
      setDriveVideos(initialVideos || [])
    } finally {
      setIsLoading(false)
    }
  }

  // Deleta vídeo do Drive e do banco
  const handleDeleteVideo = async (videoId: string, videoName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${videoName}"?\n\nO vídeo será removido do Google Drive e do Leadgram.`)) {
      return
    }

    setDeletingVideoId(videoId)
    try {
      const response = await fetch('/api/google-drive/delete-video', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          ideaId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Video deleted:', data)
        // Remove da lista local
        setDriveVideos(prev => prev.filter((v: any) => v.id !== videoId))
      } else {
        const error = await response.json()
        alert(`Erro ao deletar vídeo: ${error.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Erro ao deletar vídeo. Tente novamente.')
    } finally {
      setDeletingVideoId(null)
    }
  }

  // Busca vídeos ao montar o componente
  useEffect(() => {
    fetchVideos()
  }, [ideaId])

  const handleUploadComplete = () => {
    // Recarrega os vídeos ao invés de recarregar a página inteira
    fetchVideos()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Vídeos no Google Drive</h2>
        </div>
        <button
          onClick={fetchVideos}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Faça upload de vídeos para esta ideia. Os vídeos serão salvos diretamente no seu Google Drive
        com qualidade original preservada.
      </p>

      {/* Video Upload Component */}
      <VideoUpload
        ideaId={ideaId}
        ideaTitle={ideaTitle}
        onUploadComplete={handleUploadComplete}
      />

      {/* Uploaded Videos List */}
      {isLoading ? (
        <div className="mt-6 text-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-gray-600">Sincronizando com Google Drive...</p>
        </div>
      ) : driveVideos.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Vídeos enviados ({driveVideos.length})
          </h3>
          <div className="space-y-2">
            {driveVideos.map((video: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Folder className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{video.name}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(video.uploadedAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {driveFolderId && (
                    <a
                      href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Abrir pasta
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteVideo(video.id, video.name)}
                    disabled={deletingVideoId === video.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Excluir vídeo"
                  >
                    {deletingVideoId === video.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center py-8 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum vídeo enviado ainda</p>
        </div>
      )}
    </div>
  )
}
