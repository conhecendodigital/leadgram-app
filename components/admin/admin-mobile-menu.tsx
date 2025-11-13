'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  DollarSign,
  BarChart3,
  Package,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Clientes', href: '/admin/customers' },
  { icon: Package, label: 'Planos', href: '/admin/plans' },
  { icon: DollarSign, label: 'Pagamentos', href: '/admin/payments' },
  { icon: CreditCard, label: 'Mercado Pago', href: '/admin/mercadopago' },
  { icon: BarChart3, label: 'Relatórios', href: '/admin/reports' },
  { icon: Settings, label: 'Configurações', href: '/admin/settings' },
]

export default function AdminMobileMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
        aria-label="Menu"
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
            className="lg:hidden fixed right-0 top-0 bottom-0 w-80 bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-400">Leadgram</p>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                      ${isActive
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white active:scale-95'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Footer - User & Logout */}
            <div className="p-4 border-t border-gray-800 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Admin</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-950 rounded-xl font-medium transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
