'use client'

import { useState, useEffect } from 'react'
import { Bell, Database, Shield, Mail, Webhook } from 'lucide-react'
import { notificationService } from '@/lib/services/notification-service'
import type { NotificationSettings as NotificationSettingsType } from '@/lib/types/notifications'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications')

  const tabs = [
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Configurações
        </h1>
        <p className="text-gray-600">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-2">
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
                          : 'text-gray-600 hover:bg-gray-100'
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
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

function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    notify_new_users: true,
    notify_payments: true,
    notify_cancellations: true,
    notify_system_errors: true,
    email_on_errors: true,
    admin_email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await notificationService.getSettings();
      if (data) {
        setSettings({
          notify_new_users: data.notify_new_users,
          notify_payments: data.notify_payments,
          notify_cancellations: data.notify_cancellations,
          notify_system_errors: data.notify_system_errors,
          email_on_errors: data.email_on_errors,
          admin_email: data.admin_email || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await notificationService.updateSettings(settings);
      setMessage({ type: 'success', text: 'Preferências salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar preferências' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notificações</h2>
          <p className="text-gray-600">Configure quando e como receber notificações</p>
        </div>
        <div className="p-8 text-center text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Notificações
        </h2>
        <p className="text-gray-600">
          Configure quando e como receber notificações
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Novos Usuários</p>
            <p className="text-sm text-gray-500">
              Notificar quando um novo usuário se registrar
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.notify_new_users}
            onChange={(e) => setSettings({ ...settings, notify_new_users: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Novos Pagamentos</p>
            <p className="text-sm text-gray-500">
              Notificar sobre novos pagamentos recebidos
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.notify_payments}
            onChange={(e) => setSettings({ ...settings, notify_payments: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Cancelamentos</p>
            <p className="text-sm text-gray-500">
              Notificar quando um usuário cancelar assinatura
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.notify_cancellations}
            onChange={(e) => setSettings({ ...settings, notify_cancellations: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Erros do Sistema</p>
            <p className="text-sm text-gray-500">
              Notificar sobre erros críticos do sistema
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.notify_system_errors}
            onChange={(e) => setSettings({ ...settings, notify_system_errors: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Email em Erros</p>
            <p className="text-sm text-gray-500">
              Enviar email quando houver erros críticos
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.email_on_errors}
            onChange={(e) => setSettings({ ...settings, email_on_errors: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        {settings.email_on_errors && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Admin
            </label>
            <input
              type="email"
              value={settings.admin_email}
              onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
              placeholder="admin@leadgram.app"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Preferências'}
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Banco de Dados
        </h2>
        <p className="text-gray-600">
          Informações e manutenção do banco de dados
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Status da Conexão
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Conectado</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Último Backup
          </p>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <button className="w-full px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary transition-colors">
            Criar Backup
          </button>
          <button className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Segurança
        </h2>
        <p className="text-gray-600">
          Configure as opções de segurança da aplicação
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
            <p className="text-sm text-gray-500">
              Exigir 2FA para todos os admins
            </p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Limite de Tentativas de Login</p>
            <p className="text-sm text-gray-500">
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
            <p className="font-medium text-gray-900">Log de Auditoria</p>
            <p className="text-sm text-gray-500">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configurações de Email
        </h2>
        <p className="text-gray-600">
          Configure o serviço de envio de emails
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provedor de Email
          </label>
          <select className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent">
            <option>SMTP</option>
            <option>SendGrid</option>
            <option>Mailgun</option>
            <option>Amazon SES</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de Remetente
          </label>
          <input
            type="email"
            defaultValue="noreply@leadgram.app"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome de Exibição
          </label>
          <input
            type="text"
            defaultValue="Leadgram"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            Salvar Configurações
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Webhooks
        </h2>
        <p className="text-gray-600">
          Configure webhooks para integração com outros sistemas
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900">Mercado Pago Webhook</p>
              <p className="text-sm text-gray-500">
                /api/mercadopago/webhook
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Ativo
            </span>
          </div>
          <p className="text-xs text-gray-500">
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
