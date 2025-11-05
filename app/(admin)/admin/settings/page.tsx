'use client'

import { useState, useEffect } from 'react'
import { Settings, Bell, Database, Shield, Mail, Webhook, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const { settings, loading, updateSettings } = useSettings()
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'limits', label: 'Limites de Planos', icon: Database },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as configurações do sistema - As alterações são aplicadas em tempo real
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-600 dark:text-green-400 font-medium">
            Configurações salvas com sucesso!
          </p>
        </div>
      )}

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
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
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
            {activeTab === 'general' && <GeneralSettings settings={settings.general || {}} updateSettings={updateSettings} setSaving={setSaving} saving={saving} setSaveSuccess={setSaveSuccess} />}
            {activeTab === 'limits' && <LimitsSettings settings={settings.limits || {}} updateSettings={updateSettings} setSaving={setSaving} saving={saving} setSaveSuccess={setSaveSuccess} />}
            {activeTab === 'notifications' && <NotificationSettings settings={settings.notifications || {}} updateSettings={updateSettings} setSaving={setSaving} saving={saving} setSaveSuccess={setSaveSuccess} />}
            {activeTab === 'security' && <SecuritySettings settings={settings.security || {}} updateSettings={updateSettings} setSaving={setSaving} saving={saving} setSaveSuccess={setSaveSuccess} />}
            {activeTab === 'email' && <EmailSettings settings={settings.email || {}} updateSettings={updateSettings} setSaving={setSaving} saving={saving} setSaveSuccess={setSaveSuccess} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneralSettings({ settings, updateSettings, setSaving, saving, setSaveSuccess }: any) {
  const [formData, setFormData] = useState({
    app_name: '',
    app_url: '',
    maintenance_mode: false,
    maintenance_message: '',
  })

  useEffect(() => {
    setFormData({
      app_name: settings.app_name || 'Leadgram',
      app_url: settings.app_url || 'https://leadgram.app',
      maintenance_mode: settings.maintenance_mode || false,
      maintenance_message: settings.maintenance_message || 'Estamos em manutenção. Voltaremos em breve!',
    })
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    const result = await updateSettings(formData)
    setSaving(false)
    if (result.success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

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
            value={formData.app_name}
            onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Será exibido no header e emails</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL da Aplicação
          </label>
          <input
            type="url"
            value={formData.app_url}
            onChange={(e) => setFormData({ ...formData, app_url: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">URL principal da aplicação</p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Modo de Manutenção
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenance"
              checked={formData.maintenance_mode}
              onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="maintenance" className="text-sm text-gray-600 dark:text-gray-400">
              Ativar modo de manutenção (bloqueia acesso para usuários não-admin)
            </label>
          </div>
        </div>

        {formData.maintenance_mode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensagem de Manutenção
            </label>
            <textarea
              value={formData.maintenance_message}
              onChange={(e) => setFormData({ ...formData, maintenance_message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Mensagem exibida para usuários durante manutenção</p>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function LimitsSettings({ settings, updateSettings, setSaving, saving, setSaveSuccess }: any) {
  const [formData, setFormData] = useState({
    free_max_ideas: 10,
    pro_max_ideas: 50,
    premium_max_ideas: -1,
    free_max_posts_per_month: 5,
    pro_max_posts_per_month: 30,
    premium_max_posts_per_month: -1,
  })

  useEffect(() => {
    setFormData({
      free_max_ideas: settings.free_max_ideas || 10,
      pro_max_ideas: settings.pro_max_ideas || 50,
      premium_max_ideas: settings.premium_max_ideas || -1,
      free_max_posts_per_month: settings.free_max_posts_per_month || 5,
      pro_max_posts_per_month: settings.pro_max_posts_per_month || 30,
      premium_max_posts_per_month: settings.premium_max_posts_per_month || -1,
    })
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    const result = await updateSettings(formData)
    setSaving(false)
    if (result.success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Limites de Planos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure os limites para cada plano de assinatura (-1 = ilimitado)
        </p>
      </div>

      <div className="space-y-6">
        {/* Free Plan */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Plano Free</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo de Ideias
            </label>
            <input
              type="number"
              value={formData.free_max_ideas}
              onChange={(e) => setFormData({ ...formData, free_max_ideas: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Posts por Mês
            </label>
            <input
              type="number"
              value={formData.free_max_posts_per_month}
              onChange={(e) => setFormData({ ...formData, free_max_posts_per_month: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Plano Pro</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo de Ideias
            </label>
            <input
              type="number"
              value={formData.pro_max_ideas}
              onChange={(e) => setFormData({ ...formData, pro_max_ideas: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Posts por Mês
            </label>
            <input
              type="number"
              value={formData.pro_max_posts_per_month}
              onChange={(e) => setFormData({ ...formData, pro_max_posts_per_month: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Plano Premium</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo de Ideias
            </label>
            <input
              type="number"
              value={formData.premium_max_ideas}
              onChange={(e) => setFormData({ ...formData, premium_max_ideas: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Use -1 para ilimitado</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Posts por Mês
            </label>
            <input
              type="number"
              value={formData.premium_max_posts_per_month}
              onChange={(e) => setFormData({ ...formData, premium_max_posts_per_month: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Use -1 para ilimitado</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Limites
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationSettings({ settings, updateSettings, setSaving, saving, setSaveSuccess }: any) {
  const [formData, setFormData] = useState({
    notify_new_user: true,
    notify_new_payment: true,
    notify_cancellation: true,
    notify_system_error: true,
    admin_notification_email: '',
  })

  useEffect(() => {
    setFormData({
      notify_new_user: settings.notify_new_user ?? true,
      notify_new_payment: settings.notify_new_payment ?? true,
      notify_cancellation: settings.notify_cancellation ?? true,
      notify_system_error: settings.notify_system_error ?? true,
      admin_notification_email: settings.admin_notification_email || 'matheussss.afiliado@gmail.com',
    })
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    const result = await updateSettings(formData)
    setSaving(false)
    if (result.success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email para Notificações
          </label>
          <input
            type="email"
            value={formData.admin_notification_email}
            onChange={(e) => setFormData({ ...formData, admin_notification_email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Email que receberá as notificações administrativas</p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Novos Usuários</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Notificar quando um novo usuário se registrar
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.notify_new_user}
              onChange={(e) => setFormData({ ...formData, notify_new_user: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              checked={formData.notify_new_payment}
              onChange={(e) => setFormData({ ...formData, notify_new_payment: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              checked={formData.notify_cancellation}
              onChange={(e) => setFormData({ ...formData, notify_cancellation: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              checked={formData.notify_system_error}
              onChange={(e) => setFormData({ ...formData, notify_system_error: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Preferências
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ settings, updateSettings, setSaving, saving, setSaveSuccess }: any) {
  const [formData, setFormData] = useState({
    require_2fa_admin: false,
    login_attempt_limit: 5,
    enable_audit_log: true,
    session_timeout: 3600,
  })

  useEffect(() => {
    setFormData({
      require_2fa_admin: settings.require_2fa_admin || false,
      login_attempt_limit: settings.login_attempt_limit || 5,
      enable_audit_log: settings.enable_audit_log ?? true,
      session_timeout: settings.session_timeout || 3600,
    })
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    const result = await updateSettings(formData)
    setSaving(false)
    if (result.success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

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
            checked={formData.require_2fa_admin}
            onChange={(e) => setFormData({ ...formData, require_2fa_admin: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Limite de Tentativas de Login
          </label>
          <input
            type="number"
            value={formData.login_attempt_limit}
            onChange={(e) => setFormData({ ...formData, login_attempt_limit: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Bloquear após N tentativas falhas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeout de Sessão (segundos)
          </label>
          <input
            type="number"
            value={formData.session_timeout}
            onChange={(e) => setFormData({ ...formData, session_timeout: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">3600 = 1 hora, 7200 = 2 horas</p>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Log de Auditoria</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registrar todas as ações administrativas
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.enable_audit_log}
            onChange={(e) => setFormData({ ...formData, enable_audit_log: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmailSettings({ settings, updateSettings, setSaving, saving, setSaveSuccess }: any) {
  const [formData, setFormData] = useState({
    email_provider: 'smtp',
    email_from: 'noreply@leadgram.app',
    email_from_name: 'Leadgram',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
  })

  useEffect(() => {
    setFormData({
      email_provider: settings.email_provider || 'smtp',
      email_from: settings.email_from || 'noreply@leadgram.app',
      email_from_name: settings.email_from_name || 'Leadgram',
      smtp_host: settings.smtp_host || '',
      smtp_port: settings.smtp_port || 587,
      smtp_user: settings.smtp_user || '',
      smtp_password: settings.smtp_password || '',
    })
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    const result = await updateSettings(formData)
    setSaving(false)
    if (result.success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

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
          <select
            value={formData.email_provider}
            onChange={(e) => setFormData({ ...formData, email_provider: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email de Remetente
          </label>
          <input
            type="email"
            value={formData.email_from}
            onChange={(e) => setFormData({ ...formData, email_from: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome de Exibição
          </label>
          <input
            type="text"
            value={formData.email_from_name}
            onChange={(e) => setFormData({ ...formData, email_from_name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {formData.email_provider === 'smtp' && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Configurações SMTP</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Host SMTP
              </label>
              <input
                type="text"
                value={formData.smtp_host}
                onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Porta SMTP
              </label>
              <input
                type="number"
                value={formData.smtp_port}
                onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuário SMTP
              </label>
              <input
                type="text"
                value={formData.smtp_user}
                onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha SMTP
              </label>
              <input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
