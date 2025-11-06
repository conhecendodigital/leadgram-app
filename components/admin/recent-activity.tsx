'use client'

import { useState, useEffect } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { notificationService } from '@/lib/services/notification-service';
import type { AdminNotification } from '@/lib/types/notifications';
import Link from 'next/link';

export default function RecentActivity() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(5);
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    return `Há ${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Atividades Recentes
            </h2>
            <p className="text-sm text-gray-500">
              Últimas notificações do sistema
            </p>
          </div>
        </div>
        <Link
          href="/admin/notifications"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">
          <div className="animate-spin w-6 h-6 border-3 border-gray-200 border-t-red-600 rounded-full mx-auto mb-2"></div>
          Carregando...
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 ${
                !notif.is_read ? 'bg-blue-50' : ''
              }`}
            >
              <span className="text-2xl flex-shrink-0">{getIcon(notif.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(notif.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
