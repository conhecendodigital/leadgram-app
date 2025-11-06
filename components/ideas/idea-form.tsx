'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, Video } from 'lucide-react'
import type { IdeaFormData, Idea, Platform } from '@/types/idea.types'

interface IdeaFormProps {
  idea?: Idea
  mode: 'create' | 'edit'
}

export default function IdeaForm({ idea, mode }: IdeaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<IdeaFormData>({
    title: idea?.title || '',
    theme: idea?.theme || '',
    script: idea?.script || '',
    editor_instructions: idea?.editor_instructions || '',
    status: idea?.status || 'idea',
    funnel_stage: idea?.funnel_stage || 'top',
    platforms: idea?.platforms?.map(p => p.platform) || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create' ? '/api/ideas' : `/api/ideas/${idea?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar ideia')
      }

      const data = await response.json()

      // Mostrar tela de sucesso apenas ao criar
      if (mode === 'create') {
        setSuccess(true)
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/dashboard/ideas')
          router.refresh()
        }, 3000)
      } else {
        // No modo edição, redirecionar direto
        router.push(`/dashboard/ideas/${data.id}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar ideia')
    } finally {
      setLoading(false)
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

  // Tela de sucesso
  if (success) {
    const motivationalMessages = [
      "Sua ideia foi salva! Agora é hora de dar vida a ela. Bora gravar? 🎬",
      "Ideia criada com sucesso! O mundo está esperando para ver seu conteúdo. Vamos gravar? 🚀",
      "Perfeito! Sua ideia está salva. Que tal transformá-la em realidade agora? 🎥",
      "Ideia registrada! Seu público está ansioso pelo próximo conteúdo. Hora de gravar! 💪",
      "Sucesso! Essa ideia tem potencial. Não deixe ela esperando, bora gravar! ⭐",
    ]
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Ideia criada com sucesso!
        </h3>
        <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
          {randomMessage}
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

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
          placeholder="Ex: 5 dicas para aumentar o engajamento"
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
          placeholder="Ex: Marketing Digital, Produtividade, etc."
        />
      </div>

      {/* Roteiro */}
      <div>
        <label htmlFor="script" className="block text-sm font-medium text-gray-700 mb-2">
          Roteiro
        </label>
        <textarea
          id="script"
          rows={6}
          value={formData.script}
          onChange={(e) => setFormData({ ...formData, script: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          placeholder="Descreva o roteiro do seu conteúdo..."
        />
      </div>

      {/* Instruções para o Editor */}
      <div>
        <label htmlFor="editor_instructions" className="block text-sm font-medium text-gray-700 mb-2">
          Instruções para o Editor
        </label>
        <textarea
          id="editor_instructions"
          rows={4}
          value={formData.editor_instructions}
          onChange={(e) => setFormData({ ...formData, editor_instructions: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          placeholder="Orientações especiais para edição..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="idea">Ideia</option>
            <option value="recorded">Gravado</option>
            <option value="posted">Postado</option>
          </select>
        </div>

        {/* Funil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Estágio do Funil *
          </label>
          <div className="flex gap-3">
            {[
              { value: 'top', label: 'Topo' },
              { value: 'middle', label: 'Meio' },
              { value: 'bottom', label: 'Fundo' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/30"
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
                  onChange={(e) => setFormData({ ...formData, funnel_stage: e.target.value as any })}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
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
          disabled={loading}
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : mode === 'create' ? (
            'Criar Ideia'
          ) : (
            'Salvar Alterações'
          )}
        </button>
      </div>
    </form>
  )
}
