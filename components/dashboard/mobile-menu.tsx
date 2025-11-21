'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Lightbulb, BarChart3, Instagram, Settings, LogOut, Search, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Lightbulb, label: 'Ideias', href: '/dashboard/ideas' },
    { icon: Search, label: 'Explorar', href: '/dashboard/explore' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Instagram, label: 'Instagram', href: '/dashboard/instagram' },
  ]

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/role')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin || false)
        } else {
          // Se não conseguir verificar, assume que não é admin
          setIsAdmin(false)
        }
      } catch (error) {
        // Em caso de erro, assume que não é admin (fail-safe)
        setIsAdmin(false)
      }
    }
    checkAdminStatus()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 gradient-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Menu Slide */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Menu
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href

                  return (
                    <m.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                          ${isActive
                            ? 'gradient-primary text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </m.div>
                  )
                })}

                {/* Admin Panel Button - Only for admins */}
                {isAdmin && (
                  <m.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.05 }}
                  >
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-orange-600 hover:bg-orange-50 border border-orange-200"
                    >
                      <Shield className="w-5 h-5" />
                      Painel Admin
                    </Link>
                  </m.div>
                )}
              </nav>

              {/* Divider */}
              <div className="my-6 border-t border-gray-200" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
