'use client'

import { LogOut } from 'lucide-react'
import NotificationBell from './notification-bell'
import { useLogout } from '@/hooks/use-logout'

export default function AdminHeader({ user }: { user: any }) {
  const { logout, isLoggingOut } = useLogout()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 gap-3">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
            Painel Administrativo
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Notifications */}
          <NotificationBell />

          {/* Logout */}
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg sm:rounded-xl font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
