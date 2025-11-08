'use client'

import { useState, useEffect } from 'react'
import { Bell, Database, Shield, Mail, Webhook, HardDrive, Users, Lightbulb } from 'lucide-react'
import { notificationService } from '@/lib/services/notification-service'
import { databaseService } from '@/lib/services/database-service'
import type { NotificationSettings as NotificationSettingsType } from '@/lib/types/notifications'
import type { DatabaseStats, CleanupStats } from '@/lib/types/database'
import { securityService } from '@/lib/services/security-service'
import { TwoFASetup } from '@/components/admin/2fa-setup'
import type { SecuritySettings as SecuritySettingsType } from '@/lib/types/security'

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
      const data = await notificationService.instance.getSettings();
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
      await notificationService.instance.updateSettings(settings);
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
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [cleanupStats, setCleanupStats] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, cleanupData] = await Promise.all([
        databaseService.instance.getStats(),
        databaseService.instance.getCleanupStats()
      ]);
      setStats(statsData);
      setCleanupStats(cleanupData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showMessage('error', 'Erro ao carregar dados do banco');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCleanupNotifications = async () => {
    if (!confirm('Tem certeza que deseja limpar notificações antigas (90+ dias)?')) return;
    setCleaning(true);
    try {
      const count = await databaseService.instance.cleanupOldData('notifications');
      await loadData();
      showMessage('success', `${count} notificações antigas removidas!`);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      showMessage('error', 'Erro ao limpar dados');
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Banco de Dados</h2>
          <p className="text-gray-600">Informações e manutenção do banco de dados</p>
        </div>
        <div className="p-8 text-center text-gray-500">Carregando...</div>
      </div>
    );
  }

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

      {/* ========== ESTATÍSTICAS DO BANCO (MANTER) ========== */}
      {stats && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas do Banco</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                  <p className="text-sm text-blue-700">Usuários</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalIdeas}</p>
                  <p className="text-sm text-purple-700">Ideias</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.totalNotifications}</p>
                  <p className="text-sm text-green-700">Notificações</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <HardDrive className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-900">{stats.databaseSize}</p>
                  <p className="text-sm text-orange-700">Tamanho</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== LIMPEZA DE DADOS (MANTER) ========== */}
      {cleanupStats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Limpeza de Dados</h3>
          <p className="text-sm text-gray-600 mb-4">Remove dados antigos para liberar espaço</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🗑️</span>
                <div>
                  <p className="font-medium text-gray-900">Notificações Antigas</p>
                  <p className="text-sm text-gray-600">
                    {cleanupStats.oldNotifications || 0} notificações com mais de 90 dias
                  </p>
                </div>
              </div>
              <button
                onClick={handleCleanupNotifications}
                disabled={!cleanupStats.oldNotifications || cleaning}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cleaning ? 'Limpando...' : 'Limpar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== GERENCIAMENTO AVANÇADO (NOVO) ========== */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Gerenciamento Avançado
            </h3>
            <p className="text-sm text-gray-600">
              Acesse o Supabase Dashboard para funcionalidades avançadas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Backups */}
          <a
            href={`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}/settings/database`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💾</span>
                  <h4 className="font-semibold text-gray-900">Backups</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Criar, restaurar e gerenciar backups automáticos
                </p>
              </div>
              <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Card: Otimização */}
          <a
            href={`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}/database/query-performance`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⚡</span>
                  <h4 className="font-semibold text-gray-900">Performance</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Monitorar queries e otimizar performance
                </p>
              </div>
              <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Card: Tabelas */}
          <a
            href={`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}/editor`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📊</span>
                  <h4 className="font-semibold text-gray-900">Editor de Tabelas</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Visualizar e editar dados diretamente
                </p>
              </div>
              <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Card: SQL Editor */}
          <a
            href={`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}/sql`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💻</span>
                  <h4 className="font-semibold text-gray-900">SQL Editor</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Executar queries SQL customizadas
                </p>
              </div>
              <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> O Supabase já gerencia backups automáticos diários.
            Acesse a seção de Backups para configurar retenção e restauração.
          </p>
        </div>
      </div>

      {/* Messages */}
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
    </div>
  )
}

function SecuritySettings() {
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [settings, setSettings] = useState<any>(null);
  const [twoFAStatus, setTwoFAStatus] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Importar dinamicamente o securityService
      const { securityService } = await import('@/lib/services/security-service');
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [settingsData, twoFAData, sessionsData, attemptsData, ipsData, logsData] = await Promise.all([
        securityService.instance.getSettings(),
        user ? securityService.instance.get2FAStatus(user.id) : null,
        securityService.instance.getActiveSessions(),
        securityService.instance.getLoginAttempts(20),
        securityService.instance.getBlockedIPs(),
        securityService.instance.getAuditLogs(30)
      ]);

      setSettings(settingsData);
      setTwoFAStatus(twoFAData);
      setSessions(sessionsData);
      setLoginAttempts(attemptsData);
      setBlockedIPs(ipsData);
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { securityService } = await import('@/lib/services/security-service');
      await securityService.instance.updateSettings(settings);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja encerrar esta sessão?')) return;
    try {
      const { securityService } = await import('@/lib/services/security-service');
      await securityService.instance.terminateSession(sessionId);
      await loadSecurityData();
      setMessage({ type: 'success', text: 'Sessão encerrada com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao encerrar sessão' });
    }
  };

  const handleUnblockIP = async (id: string) => {
    if (!confirm('Tem certeza que deseja desbloquear este IP?')) return;
    try {
      const { securityService } = await import('@/lib/services/security-service');
      await securityService.instance.unblockIP(id);
      await loadSecurityData();
      setMessage({ type: 'success', text: 'IP desbloqueado com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao desbloquear IP' });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Segurança</h2>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  const subTabs = [
    { id: 'general', label: 'Geral' },
    { id: 'sessions', label: 'Sessões' },
    { id: 'access', label: 'Acessos' },
    { id: 'ips', label: 'IPs Bloqueados' },
    { id: 'audit', label: 'Auditoria' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Segurança</h2>
        <p className="text-gray-600">Configure as opções de segurança da aplicação</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSubTab === tab.id
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeSubTab === 'general' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
              <p className="text-sm text-gray-500">
                {twoFAStatus?.enabled ? '2FA está ativo' : 'Adicione uma camada extra de segurança'}
              </p>
            </div>
            {twoFAStatus?.enabled ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Ativo
              </span>
            ) : (
              <button
                onClick={() => setShow2FASetup(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Ativar 2FA
              </button>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Limite de Tentativas de Login</p>
              <p className="text-sm text-gray-500">
                Bloquear após {settings.max_login_attempts} tentativas falhas
              </p>
            </div>
            <input
              type="number"
              value={settings.max_login_attempts}
              onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
              className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
              min="3"
              max="10"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Duração do Bloqueio</p>
              <p className="text-sm text-gray-500">
                Tempo em minutos que o IP fica bloqueado
              </p>
            </div>
            <input
              type="number"
              value={settings.lockout_duration}
              onChange={(e) => setSettings({ ...settings, lockout_duration: parseInt(e.target.value) })}
              className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
              min="5"
              max="60"
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
              checked={settings.enable_audit_log}
              onChange={(e) => setSettings({ ...settings, enable_audit_log: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{sessions.length} sessões ativas</p>
          {sessions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nenhuma sessão ativa</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{session.device_type || 'Desktop'} - {session.browser || 'Navegador'}</p>
                      <p className="text-sm text-gray-600 mt-1">{session.ip_address}</p>
                      <p className="text-xs text-gray-500 mt-1">Última atividade: {formatDate(session.last_activity)}</p>
                    </div>
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Encerrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Login Attempts */}
      {activeSubTab === 'access' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Últimas {loginAttempts.length} tentativas de login</p>
          {loginAttempts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nenhuma tentativa registrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">IP</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loginAttempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td className="px-4 py-3 text-sm">{attempt.email || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{attempt.ip_address}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          attempt.success
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {attempt.success ? 'Sucesso' : 'Falha'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(attempt.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Blocked IPs */}
      {activeSubTab === 'ips' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{blockedIPs.length} IPs bloqueados</p>
          {blockedIPs.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nenhum IP bloqueado</p>
          ) : (
            <div className="space-y-2">
              {blockedIPs.map((ip) => (
                <div key={ip.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium font-mono text-gray-900">{ip.ip_address}</p>
                      <p className="text-sm text-gray-600 mt-1">{ip.reason || 'Sem motivo'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Bloqueado em: {formatDate(ip.blocked_at)}
                        {ip.is_permanent ? ' (Permanente)' : ip.blocked_until ? ` até ${formatDate(ip.blocked_until)}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnblockIP(ip.id)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Desbloquear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Últimas {auditLogs.length} ações registradas</p>
          {auditLogs.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nenhuma ação registrada</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{log.description || '-'}</p>
                      {log.resource_type && (
                        <p className="text-xs text-gray-500 mt-1">
                          Recurso: {log.resource_type}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
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

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <TwoFASetup
          isOpen={show2FASetup}
          onClose={() => setShow2FASetup(false)}
          onSuccess={() => {
            loadSecurityData();
            setMessage({ type: 'success', text: '2FA ativado com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}
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
