'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'

interface LinkPostButtonProps {
  ideaId: string
  platformId: string
  platformName: string
  currentUrl?: string | null
  isPosted: boolean
}

export default function LinkPostButton({
  ideaId,
  platformId,
  platformName,
  currentUrl,
  isPosted,
}: LinkPostButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState(currentUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validação básica de URL
      if (!url.trim()) {
        throw new Error('Por favor, insira a URL do post')
      }

      const urlPattern = /^https?:\/\/.+/
      if (!urlPattern.test(url)) {
        throw new Error('URL inválida. Deve começar com http:// ou https://')
      }

      const response = await fetch(`/api/ideas/${ideaId}/link-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId,
          postUrl: url,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao vincular post')
      }

      setSuccess(true)
      router.refresh()

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          currentUrl
            ? 'bg-green-50 text-green-600 hover:bg-green-100'
            : 'bg-blue-50 text-primary hover:bg-blue-100'
        }`}
      >
        <LinkIcon className="w-4 h-4" />
        <span className="hidden sm:inline">
          {currentUrl ? 'Atualizar link' : 'Vincular post'}
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Vincular Post - {platformName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium">Post vinculado com sucesso!</p>
                <p className="text-sm text-gray-500 mt-1">Atualizando dados...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Como funciona:</strong> Cole a URL do seu post publicado no {platformName}.
                    O sistema irá sincronizar as métricas automaticamente.
                  </p>
                </div>

                {/* URL Input */}
                <div className="mb-4">
                  <label htmlFor="post-url" className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Post *
                  </label>
                  <input
                    id="post-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={`https://${platformName.toLowerCase()}.com/...`}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Vinculando...
                      </>
                    ) : (
                      'Vincular'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
