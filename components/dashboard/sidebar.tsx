'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, LayoutDashboard, Lightbulb, BarChart3, Instagram, Settings, Search } from 'lucide-react'

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
    isParent: true,
  },
  {
    name: 'Instagram',
    href: '/dashboard/analytics/instagram',
    icon: Instagram,
    isChild: true,
    indent: true,
  },
  {
    name: 'Ideias',
    href: '/dashboard/analytics/ideias',
    icon: Lightbulb,
    isChild: true,
    indent: true,
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
            const isActive = pathname === item.href || (item.isParent && pathname.startsWith(item.href + '/'))
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200
                    ${item.indent ? 'px-6 ml-3' : 'px-3'}
                    ${item.isChild ? 'text-sm' : 'font-medium'}
                    ${
                      isActive
                        ? item.isChild
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'bg-primary text-white shadow-lg shadow-primary/50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={item.isChild ? 'w-4 h-4' : 'w-5 h-5'} />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2025 Leadgram
        </p>
      </div>
    </aside>
  )
}
