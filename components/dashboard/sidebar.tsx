'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, LayoutDashboard, Lightbulb, BarChart3, Instagram, Settings, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

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
    submenu: [
      {
        name: 'Instagram',
        href: '/dashboard/analytics/instagram',
        icon: Instagram,
      },
      {
        name: 'Ideias',
        href: '/dashboard/analytics/ideias',
        icon: Lightbulb,
      },
    ],
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
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

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
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            const hasSubmenu = item.submenu && item.submenu.length > 0
            const isSubmenuOpen = openSubmenu === item.href || pathname.startsWith(item.href + '/')

            return (
              <li key={item.href}>
                {hasSubmenu ? (
                  <>
                    {/* Item com submenu */}
                    <button
                      onClick={() => setOpenSubmenu(isSubmenuOpen ? null : item.href)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                        ${
                          isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/50'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium flex-1 text-left">{item.name}</span>
                      {isSubmenuOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Submenu */}
                    {isSubmenuOpen && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.submenu.map((subitem) => {
                          const isSubActive = pathname === subitem.href
                          const SubIcon = subitem.icon

                          return (
                            <li key={subitem.href}>
                              <Link
                                href={subitem.href}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                                  ${
                                    isSubActive
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }
                                `}
                              >
                                <SubIcon className="w-4 h-4" />
                                <span className="text-sm">{subitem.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  /* Item sem submenu */
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/50'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )}
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
