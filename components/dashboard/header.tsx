'use client'

import { Bell, Search, Settings, User, LogOut, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left - Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}! 👋
          </h1>
          <p className="text-sm text-gray-600">
            Veja como estão suas métricas hoje
          </p>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ideias..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Action - Nova Ideia */}
          <Link
            href="/dashboard/ideas/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Ideia</span>
          </Link>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Plano: Gratuito
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
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
