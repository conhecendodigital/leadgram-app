'use client'

import { useState, useEffect } from 'react';
import { Bell, Trash2, Check, Filter } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { notificationService } from '@/lib/services/notification-service';
import type { AdminNotification, NotificationType } from '@/lib/types/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [displayLimit, setDisplayLimit] = useState(15);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [filter, typeFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.instance.getNotifications(50, filter === 'unread');

      // Aplicar filtro de tipo se necessário
      let filtered = data;
      if (typeFilter !== 'all') {
        filtered = data.filter(n => n.type === typeFilter);
      }

      setNotifications(filtered);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setError('Falha ao carregar notificações. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      await notificationService.instance.markAsRead(id);
      await loadNotifications();
      showSuccess('Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      setError('Falha ao marcar notificação como lida');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!confirm('Deseja marcar todas as notificações como lidas?')) return;

    setLoading(true);
    try {
      await notificationService.instance.markAllAsRead();
      await loadNotifications();
      showSuccess('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      setError('Falha ao marcar todas as notificações como lidas');
    } finally {
      setLoading(false);
    }
  };

  // Deletar estará disponível quando o método for implementado no notification-service
  // const handleDelete = async (id: string) => {
  //   if (!confirm('Deseja deletar esta notificação? Esta ação não pode ser desfeita.')) return;
  //   setActionLoading(id);
  //   try {
  //     await notificationService.instance.deleteNotification(id);
  //     await loadNotifications();
  //     showSuccess('Notificação deletada com sucesso');
  //   } catch (error) {
  //     console.error('Erro ao deletar notificação:', error);
  //     setError('Falha ao deletar notificação');
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_user': return '👤';
      case 'payment': return '💰';
      case 'cancellation': return '❌';
      case 'system_error': return '⚠️';
      default: return '📬';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_user': return 'Novo Usuário';
      case 'payment': return 'Pagamento';
      case 'cancellation': return 'Cancelamento';
      case 'system_error': return 'Erro do Sistema';
      default: return 'Outro';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'new_user': return 'bg-blue-100 text-blue-700';
      case 'payment': return 'bg-green-100 text-green-700';
      case 'cancellation': return 'bg-red-100 text-red-700';
      case 'system_error': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
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

  const formatMetadata = (metadata: any) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    const items = [];

    // Campos comuns em metadata
    if (metadata.user_email) items.push(`Email: ${metadata.user_email}`);
    if (metadata.user_name) items.push(`Nome: ${metadata.user_name}`);
    if (metadata.plan) items.push(`Plano: ${metadata.plan}`);
    if (metadata.amount) items.push(`Valor: R$ ${metadata.amount}`);
    if (metadata.payment_id) items.push(`ID: ${metadata.payment_id}`);
    if (metadata.error_code) items.push(`Código: ${metadata.error_code}`);
    if (metadata.error_message) items.push(`Erro: ${metadata.error_message}`);

    // Se não encontrou campos conhecidos, mostrar JSON compacto
    if (items.length === 0) {
      const jsonStr = JSON.stringify(metadata);
      return jsonStr.length > 60 ? jsonStr.substring(0, 60) + '...' : jsonStr;
    }

    return items.join(' • ');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayedNotifications = notifications.slice(0, displayLimit);
  const hasMore = notifications.length > displayLimit;

  // Calcular estatísticas
  const last24Hours = notifications.filter(n => {
    const diff = Date.now() - new Date(n.created_at).getTime();
    return diff < 24 * 60 * 60 * 1000; // 24 horas em ms
  }).length;

  const systemErrors = notifications.filter(n => n.type === 'system_error').length;

  const loadMore = () => {
    setDisplayLimit(prev => prev + 15);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Notificações
        </h1>
        <p className="text-gray-600">
          Gerencie todas as notificações do sistema
        </p>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                <p className="text-xs text-gray-500">Não Lidas</p>
              </div>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{last24Hours}</p>
                <p className="text-xs text-gray-500">Últimas 24h</p>
              </div>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemErrors}</p>
                <p className="text-xs text-gray-500">Erros</p>
              </div>
            </div>
          </m.div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-900">
              {successMessage}
            </p>
          </div>
        </m.div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Erro ao Carregar Notificações
              </h3>
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={loadNotifications}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Não lidas {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="new_user">Novos Usuários</option>
              <option value="payment">Pagamentos</option>
              <option value="cancellation">Cancelamentos</option>
              <option value="system_error">Erros do Sistema</option>
            </select>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full mx-auto mb-4"></div>
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-1">Nenhuma notificação</p>
            <p className="text-sm">
              {filter === 'unread'
                ? 'Você não tem notificações não lidas'
                : 'Você ainda não recebeu notificações'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {displayedNotifications.map((notif, index) => (
                <m.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className={`p-5 hover:bg-gray-50 transition-colors ${
                    !notif.is_read ? 'bg-blue-50/50' : ''
                  }`}
                >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-3xl">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {notif.title}
                          </h3>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(
                            notif.type
                          )}`}
                        >
                          {getTypeLabel(notif.type)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        disabled={actionLoading === notif.id}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={notif.is_read ? 'Já lida' : 'Marcar como lida'}
                      >
                        {actionLoading === notif.id ? (
                          <div className="animate-spin w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full"></div>
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-gray-600 mb-2">{notif.message}</p>

                    <div className="flex flex-col gap-1 text-sm text-gray-400">
                      <span>{formatDate(notif.created_at)}</span>
                      {formatMetadata(notif.metadata) && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {formatMetadata(notif.metadata)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {!loading && hasMore && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <button
            onClick={loadMore}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-orange-700 transition-all shadow-sm hover:shadow-md"
          >
            Carregar mais {Math.min(15, notifications.length - displayLimit)} notificações
          </button>
        </div>
      )}

      {/* Summary */}
      {!loading && notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Exibindo {displayedNotifications.length} de {notifications.length} notificação{notifications.length !== 1 ? 'ões' : ''}
            </span>
            <span>
              {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
