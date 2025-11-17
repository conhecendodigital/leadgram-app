'use client'

import { useEffect, useState } from 'react'
import { Video, Folder, ExternalLink } from 'lucide-react'
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

  useEffect(() => {
    setDriveVideos(initialVideos || [])
  }, [initialVideos])

  const handleUploadComplete = () => {
    // Recarregar a página para pegar os dados atualizados
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Vídeos no Google Drive</h2>
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
      {driveVideos.length > 0 && (
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
              </div>
            ))}
          </div>
        </div>
      )}

      {driveVideos.length === 0 && (
        <div className="mt-6 text-center py-8 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum vídeo enviado ainda</p>
        </div>
      )}
    </div>
  )
}
