'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Palette, Type, Check } from 'lucide-react'

const themes = [
  {
    id: 'light',
    name: 'Claro',
    icon: Sun,
    description: 'Tema claro para uso diurno'
  },
  {
    id: 'dark',
    name: 'Escuro',
    icon: Moon,
    description: 'Tema escuro para reduzir cansaço visual'
  },
  {
    id: 'auto',
    name: 'Automático',
    icon: Monitor,
    description: 'Seguir preferência do sistema'
  }
]

const accentColors = [
  { name: 'Roxo', value: 'purple', color: 'from-purple-600 to-pink-600' },
  { name: 'Azul', value: 'blue', color: 'from-blue-600 to-cyan-600' },
  { name: 'Verde', value: 'green', color: 'from-green-600 to-emerald-600' },
  { name: 'Laranja', value: 'orange', color: 'from-orange-600 to-red-600' },
  { name: 'Rosa', value: 'pink', color: 'from-pink-600 to-rose-600' },
  { name: 'Índigo', value: 'indigo', color: 'from-indigo-600 to-purple-600' }
]

const fontSizes = [
  { name: 'Pequeno', value: 'small', scale: '14px' },
  { name: 'Médio', value: 'medium', scale: '16px' },
  { name: 'Grande', value: 'large', scale: '18px' }
]

export default function AppearanceSettings() {
  const [theme, setTheme] = useState('auto')
  const [accentColor, setAccentColor] = useState('purple')
  const [fontSize, setFontSize] = useState('medium')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem('theme') || 'auto'
    const savedAccent = localStorage.getItem('accentColor') || 'purple'
    const savedFontSize = localStorage.getItem('fontSize') || 'medium'

    setTheme(savedTheme)
    setAccentColor(savedAccent)
    setFontSize(savedFontSize)

    // Apply theme
    applyTheme(savedTheme)
    applyFontSize(savedFontSize)
  }, [])

  const applyTheme = (selectedTheme: string) => {
    const root = document.documentElement

    if (selectedTheme === 'auto') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', selectedTheme === 'dark')
    }
  }

  const applyFontSize = (size: string) => {
    const root = document.documentElement
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    }
    root.style.fontSize = sizeMap[size as keyof typeof sizeMap]
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const handleAccentChange = (newAccent: string) => {
    setAccentColor(newAccent)
    localStorage.setItem('accentColor', newAccent)
    // You can implement dynamic accent color changes here
  }

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize)
    applyFontSize(newSize)
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
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Tema
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escolha o tema do aplicativo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            const isSelected = theme === themeOption.id

            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-4 ring-purple-100 dark:ring-purple-900/50'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                )}

                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`} />
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {themeOption.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {themeOption.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Cor de Destaque
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personalize a cor principal da interface
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {accentColors.map((color) => {
            const isSelected = accentColor === color.value

            return (
              <button
                key={color.value}
                onClick={() => handleAccentChange(color.value)}
                className="group relative"
                title={color.name}
              >
                <div className={`
                  w-full aspect-square rounded-xl bg-gradient-to-br ${color.color}
                  transition-all group-hover:scale-110 group-hover:shadow-lg
                  ${isSelected ? 'ring-4 ring-gray-400 dark:ring-gray-600 scale-110' : ''}
                `}>
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                  {color.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
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
                  relative p-4 rounded-xl border-2 transition-all
                  ${isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-4 ring-green-100 dark:ring-green-900/50'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                )}

                <div className={`font-semibold text-gray-900 dark:text-white mb-1`} style={{ fontSize: size.scale }}>
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
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-purple-200 dark:border-gray-600 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Prévia
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentColors.find(c => c.value === accentColor)?.color || 'from-purple-600 to-pink-600'}`}></div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Leadgram
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tema {themes.find(t => t.id === theme)?.name} • Fonte {fontSizes.find(f => f.value === fontSize)?.name}
              </div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Este é um exemplo de como o texto aparecerá com as suas configurações de aparência.
          </p>
          <button className={`w-full py-2 rounded-lg bg-gradient-to-r ${accentColors.find(c => c.value === accentColor)?.color || 'from-purple-600 to-pink-600'} text-white font-semibold`}>
            Botão de Exemplo
          </button>
        </div>
      </div>
    </div>
  )
}
