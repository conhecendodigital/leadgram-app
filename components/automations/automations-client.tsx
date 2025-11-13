'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import {
  Clock,
  Calendar,
  RefreshCw,
  Bell,
  Database,
  Sparkles,
  Settings,
  ChevronRight,
  Check,
  X,
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  description: string
  icon: any
  gradient: string
  isActive: boolean
  isPremium: boolean
  category: 'scheduling' | 'posting' | 'analytics' | 'backup'
}

export default function AutomationsClient() {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: 'best-time-post',
      name: 'Publicar no Melhor Horário',
      description: 'Analisa seus dados e publica automaticamente no horário de maior engajamento',
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-500',
      isActive: false,
      isPremium: true,
      category: 'posting',
    },
    {
      id: 'schedule-posts',
      name: 'Agendamento de Posts',
      description: 'Agende seus posts para publicação automática em datas e horários específicos',
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
      isActive: false,
      isPremium: false,
      category: 'scheduling',
    },
    {
      id: 'repost-content',
      name: 'Republicação Automática',
      description: 'Republica automaticamente seus conteúdos de melhor performance',
      icon: RefreshCw,
      gradient: 'from-green-500 to-emerald-500',
      isActive: false,
      isPremium: true,
      category: 'posting',
    },
    {
      id: 'performance-alerts',
      name: 'Alertas de Performance',
      description: 'Receba notificações quando seus posts atingirem metas de engajamento',
      icon: Bell,
      gradient: 'from-orange-500 to-red-500',
      isActive: true,
      isPremium: false,
      category: 'analytics',
    },
    {
      id: 'auto-backup',
      name: 'Backup Automático',
      description: 'Backup diário automático de todas as suas ideias e conteúdos',
      icon: Database,
      gradient: 'from-indigo-500 to-purple-500',
      isActive: true,
      isPremium: false,
      category: 'backup',
    },
    {
      id: 'ai-suggestions',
      name: 'Sugestões com IA',
      description: 'Receba sugestões de conteúdo baseadas em tendências e seu histórico',
      icon: Sparkles,
      gradient: 'from-pink-500 to-rose-500',
      isActive: false,
      isPremium: true,
      category: 'analytics',
    },
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleAutomation = (id: string) => {
    setAutomations(prev =>
      prev.map(auto =>
        auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
      )
    )
  }

  const filteredAutomations = selectedCategory === 'all'
    ? automations
    : automations.filter(auto => auto.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'Todas', count: automations.length },
    { id: 'scheduling', label: 'Agendamento', count: automations.filter(a => a.category === 'scheduling').length },
    { id: 'posting', label: 'Publicação', count: automations.filter(a => a.category === 'posting').length },
    { id: 'analytics', label: 'Analytics', count: automations.filter(a => a.category === 'analytics').length },
    { id: 'backup', label: 'Backup', count: automations.filter(a => a.category === 'backup').length },
  ]

  const activeCount = automations.filter(a => a.isActive).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-xl">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{activeCount}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Automações Ativas</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{automations.length}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Disponível</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {automations.filter(a => a.isPremium).length}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">Premium</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all
                ${selectedCategory === category.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAutomations.map((automation, index) => {
          const Icon = automation.icon

          return (
            <m.div
              key={automation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                bg-white rounded-2xl border-2 transition-all duration-300
                ${automation.isActive
                  ? 'border-green-200 shadow-lg shadow-green-100'
                  : 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
                }
              `}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-br ${automation.gradient} rounded-xl shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{automation.name}</h3>
                        {automation.isPremium && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {automation.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                        w-2 h-2 rounded-full
                        ${automation.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}
                      `}
                    />
                    <span className={`text-sm font-medium ${automation.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {automation.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors duration-300
                        ${automation.isActive ? 'bg-green-500' : 'bg-gray-300'}
                      `}
                    >
                      <div
                        className={`
                          absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300
                          ${automation.isActive ? 'translate-x-6' : 'translate-x-0.5'}
                        `}
                      />
                    </button>

                    {/* Settings */}
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Configurações"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </m.div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAutomations.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma automação encontrada
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Tente selecionar outra categoria
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Ver Todas
          </button>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">
              💎 Desbloqueie Mais Automações com o Plano Pro
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Automações premium incluem publicação inteligente, republicação automática e sugestões com IA.
              Upgrade agora e economize horas do seu tempo!
            </p>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
              Ver Planos Pro
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
