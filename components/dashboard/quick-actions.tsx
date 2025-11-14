'use client'

import { m, AnimatePresence } from 'framer-motion'
import { Plus, Upload, Zap, Instagram, Sparkles, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown com Esc
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Focus trap: focar primeiro item quando abrir
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a')
      firstLink?.focus()
    }
  }, [isOpen])

  const actions = [
    {
      icon: Plus,
      label: 'Nova Ideia',
      href: '/dashboard/ideas/new',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Upload,
      label: 'Upload',
      href: '/dashboard/upload',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      label: 'Automações',
      href: '/dashboard/automations',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      href: '/dashboard/instagram',
      gradient: 'from-pink-500 to-rose-500',
    },
  ]

  return (
    <div className="relative" data-tour="quick-actions">
      {/* Main Button */}
      <m.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu de ações rápidas"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
      >
        <Sparkles className="w-5 h-5" aria-hidden="true" />
        <span>Ações Rápidas</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </m.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Menu */}
            <m.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="menu"
              aria-label="Menu de ações rápidas"
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50"
            >
              {actions.map((action, index) => (
                <Link
                  key={action.label}
                  href={action.href}
                  role="menuitem"
                  className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl"
                >
                  <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform shadow-md`}
                      aria-hidden="true"
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {action.label}
                    </span>
                  </m.div>
                </Link>
              ))}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
