'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Goal {
  goal_type: 'views' | 'engagement' | 'weekly_posts' | 'monthly_posts'
  target_value: number
}

interface GoalsConfigModalProps {
  isOpen: boolean
  onClose: () => void
  currentGoals: Goal[]
  onSave: () => void
}

export default function GoalsConfigModal({
  isOpen,
  onClose,
  currentGoals,
  onSave
}: GoalsConfigModalProps) {
  const [goals, setGoals] = useState<Record<string, number>>({
    views: currentGoals.find(g => g.goal_type === 'views')?.target_value || 10000,
    engagement: currentGoals.find(g => g.goal_type === 'engagement')?.target_value || 5,
    weekly_posts: currentGoals.find(g => g.goal_type === 'weekly_posts')?.target_value || 3,
    monthly_posts: currentGoals.find(g => g.goal_type === 'monthly_posts')?.target_value || 12
  })
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario nao autenticado')

      // Upsert each goal
      const promises = Object.entries(goals).map(([type, value]) =>
        supabase
          .from('user_goals')
          .upsert({
            user_id: user.id,
            goal_type: type,
            target_value: value
          } as any, {
            onConflict: 'user_id,goal_type'
          })
      )

      await Promise.all(promises)

      toast.success('Metas atualizadas com sucesso!')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving goals:', error)
      toast.error('Erro ao salvar metas')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (type: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setGoals(prev => ({ ...prev, [type]: numValue }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Configurar Metas</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Views Goal */}
          <div>
            <label htmlFor="views" className="block text-sm font-medium mb-2">
              Meta de Visualizacoes
            </label>
            <input
              id="views"
              type="number"
              min="0"
              step="1000"
              value={goals.views}
              onChange={(e) => handleChange('views', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Total de visualizacoes desejadas
            </p>
          </div>

          {/* Engagement Goal */}
          <div>
            <label htmlFor="engagement" className="block text-sm font-medium mb-2">
              Meta de Engajamento (%)
            </label>
            <input
              id="engagement"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={goals.engagement}
              onChange={(e) => handleChange('engagement', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Taxa de engajamento desejada
            </p>
          </div>

          {/* Weekly Posts Goal */}
          <div>
            <label htmlFor="weekly_posts" className="block text-sm font-medium mb-2">
              Posts por Semana
            </label>
            <input
              id="weekly_posts"
              type="number"
              min="0"
              step="1"
              value={goals.weekly_posts}
              onChange={(e) => handleChange('weekly_posts', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Numero de posts semanais desejados
            </p>
          </div>

          {/* Monthly Posts Goal */}
          <div>
            <label htmlFor="monthly_posts" className="block text-sm font-medium mb-2">
              Posts por Mes
            </label>
            <input
              id="monthly_posts"
              type="number"
              min="0"
              step="1"
              value={goals.monthly_posts}
              onChange={(e) => handleChange('monthly_posts', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Numero de posts mensais desejados
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Metas'}
          </button>
        </div>
      </div>
    </div>
  )
}
