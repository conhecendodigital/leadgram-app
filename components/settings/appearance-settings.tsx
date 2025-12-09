'use client'

import { useState, useEffect } from 'react'
import { Type, Check, Moon, Sun, Monitor } from 'lucide-react'

const fontSizes = [
  { name: 'Pequeno', value: 'small', scale: '14px' },
  { name: 'Médio', value: 'medium', scale: '16px' },
  { name: 'Grande', value: 'large', scale: '18px' }
]

const themeOptions = [
  { name: 'Claro', value: 'light', icon: Sun },
  { name: 'Escuro', value: 'dark', icon: Moon },
  { name: 'Sistema', value: 'system', icon: Monitor }
]

export default function AppearanceSettings() {
  const [fontSize, setFontSize] = useState('medium')
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load saved preferences from localStorage
    const savedFontSize = localStorage.getItem('fontSize') || 'medium'
    const savedTheme = localStorage.getItem('theme') || 'light'

    setFontSize(savedFontSize)
    setTheme(savedTheme)
  }, [])

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize)

    // Dispatch custom event to notify ThemeInitializer
    window.dispatchEvent(new CustomEvent('fontsizechange', { detail: { fontSize: newSize } }))
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    // Aplicar tema
    applyTheme(newTheme)
  }

  const applyTheme = (themeValue: string) => {
    const root = document.documentElement

    if (themeValue === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', themeValue === 'dark')
    }

    // Dispara evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeValue } }))
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Tema
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escolha o tema da interface
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const isSelected = theme === option.value
            const Icon = option.icon

            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`
                  relative p-4 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-2
                  ${isSelected
                    ? 'border-2 border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                  {option.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Tamanho da Fonte
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ajuste o tamanho do texto
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {fontSizes.map((size) => {
            const isSelected = fontSize === size.value

            return (
              <button
                key={size.value}
                onClick={() => handleFontSizeChange(size.value)}
                className={`
                  relative p-4 rounded-xl transition-all cursor-pointer
                  ${isSelected
                    ? 'border-2 border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div className="font-semibold text-gray-900 dark:text-white mb-1" style={{ fontSize: size.scale }}>
                  Aa
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {size.name} ({size.scale})
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Prévia
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600"></div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Leadgram
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Fonte {fontSizes.find(f => f.value === fontSize)?.name} • Tema {themeOptions.find(t => t.value === theme)?.name}
              </div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Este é um exemplo de como o texto aparecerá com as suas configurações de aparência.
          </p>
          <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
            Botão de Exemplo
          </button>
        </div>
      </div>
    </div>
  )
}
