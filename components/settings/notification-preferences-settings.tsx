'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Target, TrendingUp, RefreshCw, AlertCircle, Check, X } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  content_ideas: boolean
  goal_achievements: boolean
  instagram_sync: boolean
  system_updates: boolean
  frequency: 'instant' | 'daily' | 'weekly'
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
}

const notificationTypes = [
  {
    id: 'content_ideas',
    name: 'Novas Ideias de Conteúdo',
    description: 'Receba notificações quando novas ideias forem geradas',
    icon: Target
  },
  {
    id: 'goal_achievements',
    name: 'Metas Alcançadas',
    description: 'Seja notificado quando atingir suas metas',
    icon: TrendingUp
  },
  {
    id: 'instagram_sync',
    name: 'Sincronização Instagram',
    description: 'Atualizações sobre sincronização de dados',
    icon: RefreshCw
  },
  {
    id: 'system_updates',
    name: 'Atualizações do Sistema',
    description: 'Novos recursos e melhorias da plataforma',
    icon: AlertCircle
  }
]

const frequencies = [
  { id: 'instant', name: 'Instantâneas', description: 'Receba notificações imediatamente' },
  { id: 'daily', name: 'Resumo Diário', description: 'Um resumo por dia às 9h' },
  { id: 'weekly', name: 'Resumo Semanal', description: 'Um resumo por semana às segundas' }
]

export default function NotificationPreferencesSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: false,
    content_ideas: true,
    goal_achievements: true,
    instagram_sync: true,
    system_updates: false,
    frequency: 'instant',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load preferences from API
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/settings/notifications')
        if (response.ok) {
          const data = await response.json()
          setPreferences({
            email_enabled: data.email_enabled,
            push_enabled: data.push_enabled,
            content_ideas: data.content_ideas,
            goal_achievements: data.goal_achievements,
            instagram_sync: data.instagram_sync,
            system_updates: data.system_updates,
            frequency: data.frequency,
            quiet_hours_enabled: data.quiet_hours_enabled,
            quiet_hours_start: data.quiet_hours_start,
            quiet_hours_end: data.quiet_hours_end,
          })
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error)
      }
    }
    loadPreferences()
  }, [])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleFrequencyChange = (frequency: 'instant' | 'daily' | 'weekly') => {
    setPreferences(prev => ({
      ...prev,
      frequency
    }))
  }

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    setPreferences(prev => ({
      ...prev,
      [`quiet_hours_${type}`]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar preferências')
      }

      setSaved(true)
      showToast.success('Preferências salvas com sucesso!')
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      showToast.error('Erro ao salvar preferências')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Canais de Notificação
            </h3>
            <p className="text-sm text-gray-600">
              Escolha como deseja receber notificações
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">
                  Notificações por Email
                </div>
                <div className="text-sm text-gray-600">
                  Receba atualizações no seu email
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email_enabled')}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${preferences.email_enabled
                  ? 'gradient-primary'
                  : 'bg-gray-300'
                }
              `}
            >
              <div className={`
                absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                ${preferences.email_enabled ? 'translate-x-6' : 'translate-x-0'}
              `} />
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">
                  Notificações Push
                </div>
                <div className="text-sm text-gray-600">
                  Notificações instantâneas no navegador
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('push_enabled')}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${preferences.push_enabled
                  ? 'gradient-primary'
                  : 'bg-gray-300'
                }
              `}
            >
              <div className={`
                absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                ${preferences.push_enabled ? 'translate-x-6' : 'translate-x-0'}
              `} />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Tipos de Notificação
          </h3>
          <p className="text-sm text-gray-600">
            Escolha quais notificações você deseja receber
          </p>
        </div>

        <div className="space-y-3">
          {notificationTypes.map((type) => {
            const Icon = type.icon
            const isEnabled = preferences[type.id as keyof NotificationPreferences]

            return (
              <div
                key={type.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {type.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {type.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(type.id as keyof NotificationPreferences)}
                  className={`
                    relative w-14 h-8 rounded-full transition-colors
                    ${isEnabled
                      ? 'gradient-primary'
                      : 'bg-gray-300'
                    }
                  `}
                >
                  <div className={`
                    absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                    ${isEnabled ? 'translate-x-6' : 'translate-x-0'}
                  `} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Frequency */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Frequência
          </h3>
          <p className="text-sm text-gray-600">
            Com que frequência deseja receber notificações
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {frequencies.map((freq) => {
            const isSelected = preferences.frequency === freq.id

            return (
              <button
                key={freq.id}
                onClick={() => handleFrequencyChange(freq.id as 'instant' | 'daily' | 'weekly')}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected
                    ? 'border-primary bg-purple-50 ring-4 ring-purple-100'
                    : 'border-gray-200 hover:border-purple-300'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">
                    {freq.name}
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {freq.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Horário Silencioso
            </h3>
            <p className="text-sm text-gray-600">
              Defina um período sem notificações
            </p>
          </div>
          <button
            onClick={() => handleToggle('quiet_hours_enabled')}
            className={`
              relative w-14 h-8 rounded-full transition-colors
              ${preferences.quiet_hours_enabled
                ? 'gradient-primary'
                : 'bg-gray-300'
              }
            `}
          >
            <div className={`
              absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
              ${preferences.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-0'}
            `} />
          </button>
        </div>

        {preferences.quiet_hours_enabled && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Início
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_start}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fim
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_end}
                onChange={(e) => handleTimeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 px-6 gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </button>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Salvo!</span>
          </div>
        )}
      </div>
    </div>
  )
}
