'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, CheckCheck, ExternalLink, Trash2, X } from 'lucide-react';
import { notificationService } from '@/lib/services/notification-service';
import type { AdminNotification } from '@/lib/types/notifications';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const previousCountRef = useRef(0);

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationService.instance.getNotifications(5),
        notificationService.instance.getUnreadCount()
      ]);
      setNotifications(notifs);

      // Verificar se há nova notificação
      if (count > previousCountRef.current && previousCountRef.current > 0) {
        setHasNewNotification(true);
        playNotificationSound();
        // Reset animação após 2 segundos
        setTimeout(() => setHasNewNotification(false), 2000);
      }
      previousCountRef.current = count;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Som de notificação usando Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Criar um som de notificação simples
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar o som (tom agradável)
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Nota A5
      oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1); // Sobe
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2); // Volta

      oscillator.type = 'sine';

      // Volume
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // Ignorar se não conseguir tocar som
    }
  };

  // Real-time subscription com Supabase
  useEffect(() => {
    loadNotifications();

    // Subscrição em tempo real
    const supabase = createClient();
    const channel = supabase
      .channel('admin_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications'
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    // Fallback: polling a cada 30s caso real-time falhe
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await notificationService.instance.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.instance.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_user': return { emoji: '👤', bg: 'bg-blue-100', color: 'text-blue-600' };
      case 'payment': return { emoji: '💰', bg: 'bg-green-100', color: 'text-green-600' };
      case 'cancellation': return { emoji: '❌', bg: 'bg-orange-100', color: 'text-orange-600' };
      case 'system_error': return { emoji: '⚠️', bg: 'bg-red-100', color: 'text-red-600' };
      default: return { emoji: '📬', bg: 'bg-gray-100', color: 'text-gray-600' };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_user': return 'Novo Usuário';
      case 'payment': return 'Pagamento';
      case 'cancellation': return 'Cancelamento';
      case 'system_error': return 'Erro';
      default: return 'Sistema';
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return notifDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="relative" ref={bellRef as any}>
      {/* Botão do Sino */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 sm:p-2.5 rounded-xl relative transition-all duration-200 ${
          isOpen
            ? 'bg-red-100 text-red-600'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        whileTap={{ scale: 0.95 }}
        animate={hasNewNotification ? {
          rotate: [0, -15, 15, -15, 15, 0],
          transition: { duration: 0.5 }
        } : {}}
      >
        <Bell className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-transform ${
          hasNewNotification ? 'animate-pulse' : ''
        }`} />

        {/* Badge de contagem */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[11px] rounded-full flex items-center justify-center px-1 font-semibold shadow-lg"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown de Notificações */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para fechar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/5"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                      title="Marcar todas como lidas"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lista de Notificações */}
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 mt-3">Carregando...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-700">Tudo em dia!</p>
                    <p className="text-sm text-gray-500 mt-1">Nenhuma notificação no momento</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif, index) => {
                      const iconData = getIcon(notif.type);
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-all group ${
                            !notif.is_read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Ícone */}
                            <div className={`w-10 h-10 ${iconData.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <span className="text-xl">{iconData.emoji}</span>
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-semibold uppercase tracking-wide ${iconData.color}`}>
                                  {getTypeLabel(notif.type)}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(notif.created_at)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>

                              {/* Link de ação */}
                              {notif.link && (
                                <Link
                                  href={notif.link}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium"
                                >
                                  Ver detalhes
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>

                            {/* Indicador de não lido */}
                            <div className="flex flex-col items-center gap-2">
                              {!notif.is_read && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                                />
                              )}
                              <button
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
                                title="Marcar como lida"
                              >
                                <Check className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Link
                    href="/admin/notifications"
                    className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-white transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Ver todas as notificações
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
