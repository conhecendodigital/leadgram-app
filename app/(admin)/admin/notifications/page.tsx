'use client'

import { useState, useEffect, useCallback } from 'react';
import { Bell, Trash2, Check, CheckCheck, Filter, RefreshCw, Search, Calendar, TrendingUp, AlertTriangle, Users, CreditCard, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '@/lib/services/notification-service';
import type { AdminNotification, NotificationType } from '@/lib/types/notifications';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(15);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await notificationService.instance.getNotifications(100, filter === 'unread');

      // Aplicar filtro de tipo
      let filtered = data;
      if (typeFilter !== 'all') {
        filtered = data.filter(n => n.type === typeFilter);
      }

      // Aplicar busca
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(n =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          JSON.stringify(n.metadata).toLowerCase().includes(query)
        );
      }

      setNotifications(filtered);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setError('Falha ao carregar notificações. Por favor, tente novamente.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filter, typeFilter, searchQuery]);

  // Carregar notificações e configurar real-time
  useEffect(() => {
    loadNotifications();

    // Real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel('admin_notifications_page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications'
        },
        () => {
          loadNotifications(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      await notificationService.instance.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      showSuccess('Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      setError('Falha ao marcar notificação como lida');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationService.instance.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      showSuccess('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      setError('Falha ao marcar todas as notificações como lidas');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_user': return { emoji: '👤', icon: Users, bg: 'bg-blue-100', color: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' };
      case 'payment': return { emoji: '💰', icon: CreditCard, bg: 'bg-green-100', color: 'text-green-600', gradient: 'from-green-500 to-green-600' };
      case 'cancellation': return { emoji: '❌', icon: XCircle, bg: 'bg-orange-100', color: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' };
      case 'system_error': return { emoji: '⚠️', icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600', gradient: 'from-red-500 to-red-600' };
      default: return { emoji: '📬', icon: Bell, bg: 'bg-gray-100', color: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' };
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

  const formatDate = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

    return notifDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    const items: { label: string; value: string }[] = [];

    if (metadata.user_email) items.push({ label: 'Email', value: metadata.user_email });
    if (metadata.user_name) items.push({ label: 'Nome', value: metadata.user_name });
    if (metadata.plan) items.push({ label: 'Plano', value: metadata.plan });
    if (metadata.amount) items.push({ label: 'Valor', value: `R$ ${Number(metadata.amount).toFixed(2)}` });
    if (metadata.payment_id) items.push({ label: 'ID Pagamento', value: metadata.payment_id });
    if (metadata.error_code) items.push({ label: 'Código Erro', value: metadata.error_code });
    if (metadata.error_message) items.push({ label: 'Mensagem', value: metadata.error_message });

    return items;
  };

  // Estatísticas
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayedNotifications = notifications.slice(0, displayLimit);
  const hasMore = notifications.length > displayLimit;

  const last24Hours = notifications.filter(n => {
    const diff = Date.now() - new Date(n.created_at).getTime();
    return diff < 24 * 60 * 60 * 1000;
  }).length;

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    last24h: last24Hours,
    newUsers: notifications.filter(n => n.type === 'new_user').length,
    payments: notifications.filter(n => n.type === 'payment').length,
    cancellations: notifications.filter(n => n.type === 'cancellation').length,
    errors: notifications.filter(n => n.type === 'system_error').length
  };

  const typeFilters = [
    { value: 'all', label: 'Todos', icon: Bell, count: stats.total },
    { value: 'new_user', label: 'Usuários', icon: Users, count: stats.newUsers },
    { value: 'payment', label: 'Pagamentos', icon: CreditCard, count: stats.payments },
    { value: 'cancellation', label: 'Cancelamentos', icon: XCircle, count: stats.cancellations },
    { value: 'system_error', label: 'Erros', icon: AlertTriangle, count: stats.errors },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            Central de Notificações
          </h1>
          <p className="text-gray-600">
            Acompanhe todos os eventos importantes do sistema
          </p>
        </div>
        <button
          onClick={() => loadNotifications(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Bell, gradient: 'from-gray-600 to-gray-700' },
          { label: 'Não Lidas', value: stats.unread, icon: Bell, gradient: 'from-blue-500 to-blue-600', highlight: stats.unread > 0 },
          { label: 'Últimas 24h', value: stats.last24h, icon: Calendar, gradient: 'from-green-500 to-green-600' },
          { label: 'Erros', value: stats.errors, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', highlight: stats.errors > 0 },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl border ${stat.highlight ? 'border-red-200 shadow-lg shadow-red-100/50' : 'border-gray-200'} p-4`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-900">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notificações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((type) => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value as NotificationType | 'all')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                typeFilter === type.value
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-200/50'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
              {type.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  typeFilter === type.value ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {type.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Status Filter + Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                filter === 'unread'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Não lidas
              {stats.unread > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  filter === 'unread' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                }`}>
                  {stats.unread}
                </span>
              )}
            </button>
          </div>

          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-medium text-sm transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading && !isRefreshing ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-1">Nenhuma notificação</p>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Nenhum resultado para sua busca'
                : filter === 'unread'
                  ? 'Todas as notificações foram lidas'
                  : 'Você ainda não recebeu notificações'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {displayedNotifications.map((notif, index) => {
                const iconData = getIcon(notif.type);
                const metadata = formatMetadata(notif.metadata);

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-5 hover:bg-gray-50 transition-all group ${
                      !notif.is_read ? 'bg-gradient-to-r from-blue-50/80 to-transparent' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${iconData.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <span className="text-2xl">{iconData.emoji}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${iconData.color}`}>
                                {getTypeLabel(notif.type)}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-400">
                                {formatDate(notif.created_at)}
                              </span>
                              {!notif.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {notif.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {notif.message}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                disabled={actionLoading === notif.id}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50"
                                title="Marcar como lida"
                              >
                                {actionLoading === notif.id ? (
                                  <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                                ) : (
                                  <Check className="w-5 h-5" />
                                )}
                              </button>
                            )}
                            {notif.link && (
                              <Link
                                href={notif.link}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                                title="Ver detalhes"
                              >
                                <TrendingUp className="w-5 h-5" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Metadata */}
                        {metadata && metadata.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {metadata.map((item, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs"
                              >
                                <span className="text-gray-500">{item.label}:</span>
                                <span className="font-medium text-gray-700">{item.value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Load More */}
      {!loading && hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setDisplayLimit(prev => prev + 15)}
          className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Carregar mais ({notifications.length - displayLimit} restantes)
        </motion.button>
      )}

      {/* Footer Stats */}
      {!loading && notifications.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Exibindo {displayedNotifications.length} de {notifications.length} notificações
          {stats.unread > 0 && ` • ${stats.unread} não lida${stats.unread > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
