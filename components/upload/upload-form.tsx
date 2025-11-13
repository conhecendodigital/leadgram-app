'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, CheckCircle2, Video, Image as ImageIcon, FileVideo, FileImage } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Platform, FunnelStage } from '@/types/idea.types'

export default function UploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    script: '',
    funnel_stage: 'top' as FunnelStage,
    platforms: [] as Platform[],
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Tipo de arquivo inválido. Use imagens (JPG, PNG, GIF, WEBP) ou vídeos (MP4, MOV, WEBM)')
      return
    }

    // Validar tamanho (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (selectedFile.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 100MB')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Gerar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)

    // Sugerir título baseado no nome do arquivo
    if (!formData.title) {
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '') // Remove extensão
      setFormData(prev => ({ ...prev, title: fileName }))
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const togglePlatform = (platform: Platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Selecione um arquivo para fazer upload')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // 1. Upload do arquivo para Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('content')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Erro ao fazer upload: ${uploadError.message}`)
      }

      // 2. Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath)

      // 3. Criar ideia com o arquivo
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          thumbnail_url: file.type.startsWith('image/') ? publicUrl : null,
          video_url: file.type.startsWith('video/') ? publicUrl : null,
          status: 'recorded', // Já tem arquivo, então marcar como "gravado"
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar ideia')
      }

      // Sucesso!
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/ideas')
        router.refresh()
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  // Tela de sucesso
  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Upload concluído com sucesso!
        </h3>
        <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
          Seu conteúdo foi enviado e a ideia foi criada automaticamente. 🎉
        </p>
        <div className="flex items-center justify-center gap-2 text-primary mb-4">
          <Video className="w-5 h-5 animate-pulse" />
          <span className="font-medium">Redirecionando para suas ideias...</span>
        </div>
        <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full gradient-primary rounded-full animate-[loading_3s_ease-in-out]" />
        </div>
      </div>
    )
  }

  const isVideo = file?.type.startsWith('video/')
  const isImage = file?.type.startsWith('image/')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Arquivo *
        </label>

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-primary hover:bg-purple-50/50 transition-all group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Clique para selecionar um arquivo
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ou arraste e solte aqui
              </p>
              <p className="text-xs text-gray-500">
                Vídeos: MP4, MOV, WEBM (máx. 100MB)
                <br />
                Imagens: JPG, PNG, GIF, WEBP (máx. 100MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border-2 border-gray-200 rounded-2xl p-4 relative">
            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-xl overflow-hidden">
                  {isVideo && preview && (
                    <video
                      src={preview}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  {isImage && preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {isVideo ? (
                    <FileVideo className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FileImage className="w-5 h-5 text-green-500" />
                  )}
                  <h4 className="font-semibold text-gray-900 truncate">
                    {file.name}
                  </h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Tipo:</span> {file.type}
                  </p>
                  <p>
                    <span className="font-medium">Tamanho:</span>{' '}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p>
                    <span className="font-medium">Categoria:</span>{' '}
                    {isVideo ? 'Vídeo' : 'Imagem'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título *
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          placeholder="Ex: Tutorial de edição de vídeo"
        />
      </div>

      {/* Tema */}
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
          Tema
        </label>
        <input
          id="theme"
          type="text"
          value={formData.theme}
          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          placeholder="Ex: Educação, Marketing Digital, etc."
        />
      </div>

      {/* Roteiro/Descrição */}
      <div>
        <label htmlFor="script" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição/Roteiro
        </label>
        <textarea
          id="script"
          rows={4}
          value={formData.script}
          onChange={(e) => setFormData({ ...formData, script: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          placeholder="Descreva brevemente o conteúdo do arquivo..."
        />
      </div>

      {/* Funil */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Estágio do Funil *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'top', label: 'Topo' },
            { value: 'middle', label: 'Meio' },
            { value: 'bottom', label: 'Fundo' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/30"
              style={{
                borderColor: formData.funnel_stage === option.value ? '#0866FF' : '#e5e7eb',
                backgroundColor: formData.funnel_stage === option.value ? '#eff6ff' : 'white',
              }}
            >
              <input
                type="radio"
                name="funnel_stage"
                value={option.value}
                checked={formData.funnel_stage === option.value}
                onChange={(e) => setFormData({ ...formData, funnel_stage: e.target.value as FunnelStage })}
                className="sr-only"
              />
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Plataformas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Plataformas
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'instagram', label: 'Instagram' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'facebook', label: 'Facebook' },
          ].map((platform) => (
            <label
              key={platform.value}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/30"
              style={{
                borderColor: formData.platforms.includes(platform.value as Platform) ? '#0866FF' : '#e5e7eb',
                backgroundColor: formData.platforms.includes(platform.value as Platform) ? '#eff6ff' : 'white',
              }}
            >
              <input
                type="checkbox"
                checked={formData.platforms.includes(platform.value as Platform)}
                onChange={() => togglePlatform(platform.value as Platform)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-gray-700">{platform.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={uploading || !file}
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Fazendo upload...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Fazer Upload
            </>
          )}
        </button>
      </div>
    </form>
  )
}
