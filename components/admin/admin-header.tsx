'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from './notification-bell'

export default function AdminHeader({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    // Chamar API de logout (limpa sessões no servidor)
    await fetch('/api/auth/logout', { method: 'POST' })

    // Logout local (limpa cookies)
    await supabase.auth.signOut()

    // Redirecionar para login
    router.push('/login')
    router.refresh()
  }

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
            onClick={handleLogout}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg sm:rounded-xl font-medium transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
