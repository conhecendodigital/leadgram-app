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
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { emailService } = await import('@/lib/services/email-service');
      const data = await emailService.instance.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showMessage('error', 'Erro ao carregar configurações de email');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { emailService } = await import('@/lib/services/email-service');
      const data = await emailService.instance.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { emailService } = await import('@/lib/services/email-service');
      await emailService.instance.updateSettings(settings);
      showMessage('success', 'Configurações salvas com sucesso!');
      await loadStats();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showMessage('error', 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.enabled || !settings.api_key) {
      showMessage('error', 'Configure a API Key e habilite o envio de emails primeiro');
      return;
    }

    const testEmail = prompt('Digite o email para teste:');
    if (!testEmail) return;

    setTesting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', `Email de teste enviado para ${testEmail}!`);
        await loadStats();
      } else {
        showMessage('error', data.error || 'Erro ao enviar email de teste');
      }
    } catch (error) {
      console.error('Erro:', error);
      showMessage('error', 'Erro ao enviar email de teste');
    } finally {
      setTesting(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações de Email</h2>
          <p className="text-gray-600">Configure o serviço de envio de emails</p>
        </div>
        <div className="p-8 text-center text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configurações de Email
        </h2>
        <p className="text-gray-600">
          Configure o serviço de envio de emails para seus usuários
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Enviados</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Sucessos</p>
            <p className="text-2xl font-bold text-green-900">{stats.sent}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 mb-1">Falhas</p>
            <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Hoje</p>
            <p className="text-2xl font-bold text-purple-900">{stats.today}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Sistema de Email</p>
            <p className="text-sm text-gray-500">
              {settings.enabled ? 'Emails sendo enviados normalmente' : 'Sistema desabilitado'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              settings.enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {settings.enabled ? 'Ativo' : 'Inativo'}
            </span>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
          </div>
        </div>

        {/* Provedor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provedor de Email
          </label>
          <select
            value={settings.provider}
            onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="resend">Resend (Recomendado)</option>
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Resend oferece 3.000 emails/mês gratuitos e é muito fácil de configurar
          </p>
        </div>

        {/* API Key */}
        {settings.provider === 'resend' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key do Resend
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs text-blue-600 hover:underline"
              >
                (Obter API Key →)
              </a>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.api_key || ''}
                onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                placeholder="re_..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              A API Key é armazenada de forma segura. Nunca a compartilhe!
            </p>
          </div>
        )}

        {/* Configurações de Remetente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Remetente
            </label>
            <input
              type="email"
              value={settings.from_email}
              onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={settings.from_name}
              onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email para Resposta (opcional)
          </label>
          <input
            type="email"
            value={settings.reply_to || ''}
            onChange={(e) => setSettings({ ...settings, reply_to: e.target.value })}
            placeholder="suporte@leadgram.app"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Limites */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Limite Diário de Emails
          </label>
          <input
            type="number"
            value={settings.daily_limit}
            onChange={(e) => setSettings({ ...settings, daily_limit: parseInt(e.target.value) })}
            min="100"
            max="10000"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enviados hoje: {settings.emails_sent_today} / {settings.daily_limit}
          </p>
        </div>

        {/* Templates Habilitados */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates de Email</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Email de Boas-vindas</p>
                <p className="text-sm text-gray-500">Enviado quando um novo usuário se cadastra</p>
              </div>
              <input
                type="checkbox"
                checked={settings.send_welcome_email}
                onChange={(e) => setSettings({ ...settings, send_welcome_email: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Confirmação de Pagamento</p>
                <p className="text-sm text-gray-500">Enviado quando um pagamento é aprovado</p>
              </div>
              <input
                type="checkbox"
                checked={settings.send_payment_confirmation}
                onChange={(e) => setSettings({ ...settings, send_payment_confirmation: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Pagamento Falhou</p>
                <p className="text-sm text-gray-500">Enviado quando há erro no pagamento</p>
              </div>
              <input
                type="checkbox"
                checked={settings.send_payment_failed}
                onChange={(e) => setSettings({ ...settings, send_payment_failed: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Assinatura Cancelada</p>
                <p className="text-sm text-gray-500">Enviado quando usuário cancela assinatura</p>
              </div>
              <input
                type="checkbox"
                checked={settings.send_subscription_cancelled}
                onChange={(e) => setSettings({ ...settings, send_subscription_cancelled: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Redefinição de Senha</p>
                <p className="text-sm text-gray-500">Enviado para recuperação de senha</p>
              </div>
              <input
                type="checkbox"
                checked={settings.send_password_reset}
                onChange={(e) => setSettings({ ...settings, send_password_reset: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Notificações do Admin</p>
                <p className="text-sm text-gray-500">Enviado para avisar admin sobre eventos</p>
              </div>
              <input
                type="checkbox"
                checked={settings.send_admin_notifications}
                onChange={(e) => setSettings({ ...settings, send_admin_notifications: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
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

        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          <button
            onClick={handleTestEmail}
            disabled={testing || !settings.enabled}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Enviando...' : 'Enviar Email de Teste'}
          </button>
        </div>
      </div>
    </div>
  )
}

function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { webhookService } = await import('@/lib/services/webhook-service');
      const [webhooksData, statsData] = await Promise.all([
        webhookService.instance.getWebhooks(),
        webhookService.instance.getStats()
      ]);
      setWebhooks(webhooksData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showMessage('error', 'Erro ao carregar webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const { webhookService } = await import('@/lib/services/webhook-service');
      const result = await webhookService.instance.testWebhook(id);

      if (result.success) {
        showMessage('success', `Webhook testado com sucesso! (${result.response_time_ms}ms)`);
      } else {
        showMessage('error', `Erro no teste: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao testar:', error);
      showMessage('error', 'Erro ao testar webhook');
    } finally {
      setTesting(null);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const { webhookService } = await import('@/lib/services/webhook-service');
      await webhookService.instance.toggleWebhook(id, enabled);
      await loadData();
      showMessage('success', `Webhook ${enabled ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alternar:', error);
      showMessage('error', 'Erro ao alternar webhook');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este webhook?')) return;

    try {
      const { webhookService } = await import('@/lib/services/webhook-service');
      await webhookService.instance.deleteWebhook(id);
      await loadData();
      showMessage('success', 'Webhook deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      showMessage('error', 'Erro ao deletar webhook');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Webhooks</h2>
          <p className="text-gray-600">Configure webhooks para integração com outros sistemas</p>
        </div>
        <div className="p-8 text-center text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Webhooks
        </h2>
        <p className="text-gray-600">
          Configure webhooks para integração com outros sistemas externos
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Webhooks</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total_webhooks}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Ativos</p>
            <p className="text-2xl font-bold text-green-900">{stats.active_webhooks}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Chamadas Hoje</p>
            <p className="text-2xl font-bold text-purple-900">{stats.total_calls_today}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Taxa de Sucesso</p>
            <p className="text-2xl font-bold text-orange-900">{stats.success_rate}%</p>
          </div>
        </div>
      )}

      {/* Lista de Webhooks */}
      <div className="space-y-3">
        {webhooks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Webhook className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Nenhum webhook configurado</p>
            <button
              onClick={() => { setEditingWebhook(null); setShowModal(true); }}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Adicionar Primeiro Webhook
            </button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      webhook.enabled && webhook.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : webhook.status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {webhook.enabled ? (webhook.status === 'active' ? 'Ativo' : 'Erro') : 'Inativo'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-1 font-mono break-all">{webhook.url}</p>

                  {webhook.description && (
                    <p className="text-sm text-gray-500 mb-2">{webhook.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {webhook.events?.map((event: string) => (
                      <span key={event} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {event}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Total: {webhook.total_calls}</span>
                    <span className="text-green-600">✓ {webhook.success_calls}</span>
                    <span className="text-red-600">✗ {webhook.failed_calls}</span>
                    {webhook.last_called_at && (
                      <span>Último: {new Date(webhook.last_called_at).toLocaleString('pt-BR')}</span>
                    )}
                  </div>

                  {webhook.last_error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      Último erro: {webhook.last_error}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleTest(webhook.id)}
                    disabled={testing === webhook.id || !webhook.enabled}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testing === webhook.id ? '⏳' : '🧪'} Testar
                  </button>

                  <button
                    onClick={() => handleToggle(webhook.id, !webhook.enabled)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    {webhook.enabled ? '⏸️ Pausar' : '▶️ Ativar'}
                  </button>

                  <button
                    onClick={() => { setEditingWebhook(webhook); setShowModal(true); }}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão Adicionar */}
      {webhooks.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => { setEditingWebhook(null); setShowModal(true); }}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Adicionar Webhook
          </button>
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

      {/* Modal de Criação/Edição */}
      {showModal && (
        <WebhookModal
          webhook={editingWebhook}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadData();
            showMessage('success', 'Webhook salvo com sucesso!');
          }}
        />
      )}
    </div>
  )
}

function WebhookModal({ webhook, onClose, onSave }: {
  webhook: any | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    description: webhook?.description || '',
    events: webhook?.events || [],
    secret: webhook?.secret || '',
    enabled: webhook?.enabled ?? true,
    max_retries: webhook?.max_retries || 3,
    retry_delay: webhook?.retry_delay || 60,
    timeout: webhook?.timeout || 30
  });
  const [saving, setSaving] = useState(false);

  const availableEvents = [
    'user.created', 'user.updated', 'user.deleted',
    'payment.created', 'payment.approved', 'payment.failed',
    'subscription.created', 'subscription.cancelled',
    'idea.created', 'idea.updated', 'custom'
  ];

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      alert('Nome e URL são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const { webhookService } = await import('@/lib/services/webhook-service');

      if (webhook) {
        await webhookService.instance.updateWebhook(webhook.id, formData);
      } else {
        await webhookService.instance.createWebhook(formData as any);
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar webhook');
    } finally {
      setSaving(false);
    }
  };

  const toggleEvent = (event: string) => {
    const newEvents = formData.events.includes(event)
      ? formData.events.filter((e: string) => e !== event)
      : [...formData.events, event];
    setFormData({ ...formData, events: newEvents });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {webhook ? 'Editar Webhook' : 'Novo Webhook'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Meu Webhook"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://api.exemplo.com/webhook"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o propósito deste webhook..."
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Eventos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eventos que este webhook escuta
            </label>
            <div className="flex flex-wrap gap-2">
              {availableEvents.map((event) => (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    formData.events.includes(event)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>

          {/* Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret (Opcional)
            </label>
            <input
              type="password"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              placeholder="chave-secreta-para-validacao"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Será enviado no header X-Webhook-Secret para validação
            </p>
          </div>

          {/* Configurações Avançadas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentativas
              </label>
              <input
                type="number"
                value={formData.max_retries}
                onChange={(e) => setFormData({ ...formData, max_retries: parseInt(e.target.value) })}
                min="1"
                max="10"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay (s)
              </label>
              <input
                type="number"
                value={formData.retry_delay}
                onChange={(e) => setFormData({ ...formData, retry_delay: parseInt(e.target.value) })}
                min="10"
                max="300"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (s)
              </label>
              <input
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                min="5"
                max="120"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Habilitado */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Webhook habilitado
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Webhook'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
