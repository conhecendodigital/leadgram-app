'use client'

import { useState, useRef } from 'react'
import { Upload, Video, X, Loader2, ExternalLink, CheckCircle } from 'lucide-react'

interface VideoUploadProps {
  ideaId: string
  ideaTitle: string
  onUploadComplete?: () => void
}

interface UploadedVideo {
  id: string
  name: string
  webViewLink?: string
  thumbnailLink?: string
}

export default function VideoUpload({ ideaId, ideaTitle, onUploadComplete }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido')
      return
    }

    // Resetar estados
    setError(null)
    setUploadedVideo(null)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      // Passo 1: Iniciar sessão de upload resumable
      const initResponse = await fetch('/api/google-drive/init-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          ideaId,
        }),
      })

      const initData = await initResponse.json()

      if (!initResponse.ok) {
        throw new Error(initData.error || 'Erro ao iniciar upload')
      }

      const { uploadUrl } = initData

      // Passo 2: Upload em chunks de 4MB
      const CHUNK_SIZE = 4 * 1024 * 1024 // 4MB
      const totalSize = selectedFile.size
      let uploadedBytes = 0
      let fileId = ''
      let fileName = ''

      while (uploadedBytes < totalSize) {
        const start = uploadedBytes
        const end = Math.min(start + CHUNK_SIZE - 1, totalSize - 1)
        const chunk = selectedFile.slice(start, end + 1)

        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('uploadUrl', uploadUrl)
        formData.append('start', start.toString())
        formData.append('end', end.toString())
        formData.append('total', totalSize.toString())

        const chunkResponse = await fetch('/api/google-drive/upload-chunk', {
          method: 'POST',
          body: formData,
        })

        const chunkData = await chunkResponse.json()

        if (!chunkResponse.ok) {
          throw new Error(chunkData.error || 'Erro ao enviar chunk')
        }

        uploadedBytes = end + 1
        setUploadProgress(Math.round((uploadedBytes / totalSize) * 100))

        if (chunkData.status === 'complete') {
          fileId = chunkData.fileId
          fileName = chunkData.fileName
          break
        }
      }

      // Passo 3: Confirmar upload no banco
      const confirmResponse = await fetch('/api/google-drive/confirm-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId,
          fileId,
          fileName: fileName || selectedFile.name,
        }),
      })

      const confirmData = await confirmResponse.json()

      if (!confirmResponse.ok) {
        throw new Error(confirmData.error || 'Erro ao confirmar upload')
      }

      setUploadedVideo({
        id: fileId,
        name: selectedFile.name,
        webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
      })
      setSelectedFile(null)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Callback
      if (onUploadComplete) {
        onUploadComplete()
      }

      setTimeout(() => {
        setUploadProgress(0)
        setUploadedVideo(null)
      }, 5000)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Erro ao fazer upload do vídeo')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setError(null)
      setUploadedVideo(null)
    } else {
      setError('Por favor, arraste um arquivo de vídeo válido')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-400"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {!selectedFile && !uploading && (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">
              Upload de Vídeo para "{ideaTitle}"
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Arraste e solte um vídeo ou clique para selecionar
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Selecionar Vídeo
            </button>
            <p className="mt-2 text-xs text-gray-400">
              MP4, MOV, AVI, WebM - Sem limite de tamanho
            </p>
          </div>
        )}

        {selectedFile && !uploading && (
          <div className="flex items-center gap-4">
            <Video className="h-10 w-10 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={handleUpload}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Fazer Upload
            </button>
          </div>
        )}

        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Fazendo upload... {uploadProgress}%
                </p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Mantendo qualidade original do vídeo...
            </p>
          </div>
        )}
      </div>

      {/* Success Message */}
      {uploadedVideo && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Vídeo enviado com sucesso!
              </p>
              <p className="text-xs text-green-700 mt-1">{uploadedVideo.name}</p>
              {uploadedVideo.webViewLink && (
                <a
                  href={uploadedVideo.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 underline"
                >
                  Ver no Google Drive
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
          {error.includes('not connected') && (
            <p className="mt-1 text-xs text-red-600">
              Por favor, conecte sua conta Google Drive primeiro.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
