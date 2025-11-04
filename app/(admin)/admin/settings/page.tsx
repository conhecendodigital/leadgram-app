'use client'

import { useState } from 'react'
import { Settings, Bell, Database, Shield, Mail, Webhook } from 'lucide-react'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'database', label: 'Banco de Dados', icon: Database },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'database' && <DatabaseSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'email' && <EmailSettings />}
            {activeTab === 'webhooks' && <WebhookSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações Gerais
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure as opções gerais da aplicação
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome da Aplicação
          </label>
          <input
            type="text"
            defaultValue="Leadgram"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL da Aplicação
          </label>
          <input
            type="url"
            defaultValue="https://leadgram.app"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Modo de Manutenção
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenance"
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="maintenance" className="text-sm text-gray-600 dark:text-gray-400">
              Ativar modo de manutenção
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notificações
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure quando e como receber notificações
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Novos Usuários</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Notificar quando um novo usuário se registrar
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Novos Pagamentos</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Notificar sobre novos pagamentos recebidos
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Cancelamentos</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Notificar quando um usuário cancelar assinatura
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Erros do Sistema</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Notificar sobre erros críticos do sistema
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="pt-4">
          <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  )
}

function DatabaseSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Banco de Dados
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Informações e manutenção do banco de dados
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status da Conexão
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Conectado</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Último Backup
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Criar Backup
          </button>
          <button className="w-full px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Otimizar Banco
          </button>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Segurança
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure as opções de segurança da aplicação
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Autenticação de Dois Fatores</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Exigir 2FA para todos os admins
            </p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Limite de Tentativas de Login</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bloquear após 5 tentativas falhas
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Log de Auditoria</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registrar todas as ações administrativas
            </p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="pt-4">
          <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}

function EmailSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações de Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure o serviço de envio de emails
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Provedor de Email
          </label>
          <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
            <option>SMTP</option>
            <option>SendGrid</option>
            <option>Mailgun</option>
            <option>Amazon SES</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email de Remetente
          </label>
          <input
            type="email"
            defaultValue="noreply@leadgram.app"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome de Exibição
          </label>
          <input
            type="text"
            defaultValue="Leadgram"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            Salvar Configurações
          </button>
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Enviar Email de Teste
          </button>
        </div>
      </div>
    </div>
  )
}

function WebhookSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Webhooks
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure webhooks para integração com outros sistemas
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Mercado Pago Webhook</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                /api/mercadopago/webhook
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              Ativo
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recebe notificações de pagamentos do Mercado Pago
          </p>
        </div>

        <div className="pt-4">
          <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            Adicionar Webhook
          </button>
        </div>
      </div>
    </div>
  )
}
