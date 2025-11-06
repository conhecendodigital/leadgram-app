'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  DollarSign,
  BarChart3,
  Package
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Clientes', href: '/admin/customers' },
  { icon: Package, label: 'Planos', href: '/admin/plans' },
  { icon: DollarSign, label: 'Pagamentos', href: '/admin/payments' },
  { icon: CreditCard, label: 'Mercado Pago', href: '/admin/mercadopago' },
  { icon: BarChart3, label: 'Relatórios', href: '/admin/reports' },
  { icon: Settings, label: 'Configurações', href: '/admin/settings' },
]

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800 fixed inset-y-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">A</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">Admin Panel</h1>
          <p className="text-xs text-gray-400">Leadgram</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                ${isActive
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
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
      </div>
    </aside>
  )
}
