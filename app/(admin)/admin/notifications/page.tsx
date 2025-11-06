'use client'

import { useState, useEffect } from 'react';
import { Bell, Trash2, Check, Filter } from 'lucide-react';
import { notificationService } from '@/lib/services/notification-service';
import type { AdminNotification, NotificationType } from '@/lib/types/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter, typeFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(50, filter === 'unread');

      // Aplicar filtro de tipo se necessário
      let filtered = data;
      if (typeFilter !== 'all') {
        filtered = data.filter(n => n.type === typeFilter);
      }

      setNotifications(filtered);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
            {notifications.map((notif) => (
              <div
                key={notif.id}
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
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={notif.is_read ? 'Já lida' : 'Marcar como lida'}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-2">{notif.message}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{formatDate(notif.created_at)}</span>
                      {notif.metadata && Object.keys(notif.metadata).length > 0 && (
                        <span className="text-xs">
                          {JSON.stringify(notif.metadata).length > 50
                            ? JSON.stringify(notif.metadata).substring(0, 50) + '...'
                            : JSON.stringify(notif.metadata)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Total: {notifications.length} notificação{notifications.length !== 1 ? 'ões' : ''}
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
