'use client'

import { useState } from 'react'
import { X, Instagram, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PublishToInstagramModalProps {
  ideaId: string
  mediaUrl: string // URL do Supabase Storage
  mediaType: 'image' | 'video'
  existingCaption?: string
  onClose: () => void
  onSuccess: () => void
}

type PublishType = 'post' | 'reel'

export default function PublishToInstagramModal({
  ideaId,
  mediaUrl,
  mediaType,
  existingCaption = '',
  onClose,
  onSuccess,
}: PublishToInstagramModalProps) {
  const [caption, setCaption] = useState(existingCaption)
  const [publishType, setPublishType] = useState<PublishType>(
    mediaType === 'video' ? 'reel' : 'post'
  )
  const [publishing, setPublishing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = async () => {
    if (!caption.trim()) {
      setError('Por favor, adicione uma legenda para o post')
      return
    }

    setPublishing(true)
    setError(null)

    try {
      const response = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: ideaId,
          media_url: mediaUrl,
          media_type: mediaType,
          publish_type: publishType,
          caption: caption.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao publicar no Instagram')
      }

      // Sucesso
      setSuccess(true)
      toast.success('Publicado no Instagram com sucesso!')

      // Aguardar 2 segundos antes de fechar e atualizar
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Erro ao publicar:', err)
      setError(err.message || 'Erro ao publicar no Instagram')
      toast.error(err.message || 'Erro ao publicar no Instagram')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Publicar no Instagram
              </h2>
              <p className="text-sm text-gray-600">
                {mediaType === 'video' ? 'Vídeo' : 'Imagem'} • {publishType === 'reel' ? 'Reels' : 'Post'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={publishing}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Success State */}
          {success && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Publicado com sucesso!
              </h3>
              <p className="text-gray-600 text-center">
                Seu conteúdo foi publicado no Instagram e vinculado automaticamente.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Erro ao publicar</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Media Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="w-full max-h-96 bg-gray-100 rounded-xl overflow-hidden">
                  {mediaType === 'video' ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Publish Type (somente para vídeos) */}
              {mediaType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Publicação
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPublishType('post')}
                      disabled={publishing}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        publishType === 'post'
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📸</div>
                        <div className="font-semibold text-gray-900">Post</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Vídeo no feed
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishType('reel')}
                      disabled={publishing}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        publishType === 'reel'
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎬</div>
                        <div className="font-semibold text-gray-900">Reels</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Vídeo vertical
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                  Legenda *
                </label>
                <textarea
                  id="caption"
                  rows={6}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={publishing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Escreva a legenda do seu post...&#10;&#10;Use emojis, hashtags e mencione outras contas!&#10;&#10;Exemplo:&#10;Mais um conteúdo incrível! 🚀&#10;&#10;#instagram #reels #conteudo"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Máximo: 2.200 caracteres
                  </p>
                  <p className={`text-xs font-medium ${
                    caption.length > 2200 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {caption.length} / 2200
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={publishing}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || !caption.trim() || caption.length > 2200}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Instagram className="w-5 h-5" />
                  Publicar no Instagram
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
