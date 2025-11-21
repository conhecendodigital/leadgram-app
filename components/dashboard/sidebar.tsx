'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, LayoutDashboard, Lightbulb, BarChart3, Instagram, Settings, Search, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Ideias',
    href: '/dashboard/ideas',
    icon: Lightbulb,
  },
  {
    name: 'Explorar',
    href: '/dashboard/explore',
    icon: Search,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Instagram',
    href: '/dashboard/instagram',
    icon: Instagram,
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

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

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Leadgram</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 font-medium
                    ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}

          {/* Admin Panel Button - Only visible for admins */}
          {isAdmin && (
            <>
              <li className="pt-2">
                <div className="border-t border-gray-200 my-2"></div>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 font-medium text-orange-600 hover:bg-orange-50 hover:text-orange-700 border border-orange-200"
                >
                  <Shield className="w-5 h-5" />
                  <span>Painel Admin</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <Link href="/legal/privacy" className="text-gray-500 hover:text-primary transition-colors">
              Privacidade
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/legal/terms" className="text-gray-500 hover:text-primary transition-colors">
              Termos
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/legal/cookies" className="text-gray-500 hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          © 2025 Leadgram
        </p>
      </div>
    </aside>
  )
}
