'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { IdeaFormData, Idea, Platform } from '@/types/idea.types'

interface IdeaFormProps {
  idea?: Idea
  mode: 'create' | 'edit'
}

export default function IdeaForm({ idea, mode }: IdeaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      router.push(`/dashboard/ideas/${data.id}`)
      router.refresh()
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
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-300"
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
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-300"
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
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
