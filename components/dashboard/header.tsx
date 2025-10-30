'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, ChevronDown } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Usuário')
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bem-vindo de volta!</h2>
          <p className="text-sm text-gray-500">Gerencie seu conteúdo e acompanhe suas métricas</p>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700">{userName}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay para fechar dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loading ? 'Saindo...' : 'Sair'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
