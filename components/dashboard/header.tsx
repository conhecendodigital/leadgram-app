'use client'

import { Search, Settings, User, LogOut, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NotificationCenter from '@/components/notifications/notification-center'

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left - Logo/Title */}
        <div className="min-w-0 flex-shrink">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
            Leadgram
          </h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ideias..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Quick Action - Nova Ideia */}
          <Link
            href="/dashboard/ideas/new"
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 bg-primary text-white rounded-lg sm:rounded-xl font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Ideia</span>
          </Link>

          {/* Notifications */}
          {user && (
            <div className="hidden md:flex">
              <NotificationCenter userId={user.id} />
            </div>
          )}

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Plano: Gratuito
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
