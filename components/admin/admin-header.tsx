'use client'

import { Bell, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminHeader({ user }: { user: any }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>

        {/* Search or Title */}
        <div className="flex-1 lg:ml-0 ml-2 sm:ml-4 min-w-0">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
            Painel Administrativo
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Notifications */}
          <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl relative">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

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
