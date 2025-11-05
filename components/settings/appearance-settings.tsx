'use client'

import { useState, useEffect } from 'react'
import { Palette, Type, Check } from 'lucide-react'

const accentColors = [
  {
    name: 'Roxo',
    value: 'purple',
    color: 'gradient-primary',
    cssVars: {
      '--primary': '139 92 246',
      '--accent': '139 92 246',
      '--ring': '139 92 246'
    }
  },
  {
    name: 'Azul',
    value: 'blue',
    color: 'from-blue-500 to-cyan-500',
    cssVars: {
      '--primary': '59 130 246',
      '--accent': '59 130 246',
      '--ring': '59 130 246'
    }
  },
  {
    name: 'Verde',
    value: 'green',
    color: 'from-green-500 to-emerald-500',
    cssVars: {
      '--primary': '34 197 94',
      '--accent': '34 197 94',
      '--ring': '34 197 94'
    }
  },
  {
    name: 'Laranja',
    value: 'orange',
    color: 'from-orange-500 to-red-500',
    cssVars: {
      '--primary': '249 115 22',
      '--accent': '249 115 22',
      '--ring': '249 115 22'
    }
  },
  {
    name: 'Rosa',
    value: 'pink',
    color: 'from-pink-500 to-rose-500',
    cssVars: {
      '--primary': '236 72 153',
      '--accent': '236 72 153',
      '--ring': '236 72 153'
    }
  },
  {
    name: 'Índigo',
    value: 'indigo',
    color: 'from-indigo-500 to-purple-500',
    cssVars: {
      '--primary': '99 102 241',
      '--accent': '99 102 241',
      '--ring': '99 102 241'
    }
  }
]

const fontSizes = [
  { name: 'Pequeno', value: 'small', scale: '14px' },
  { name: 'Médio', value: 'medium', scale: '16px' },
  { name: 'Grande', value: 'large', scale: '18px' }
]

export default function AppearanceSettings() {
  const [accentColor, setAccentColor] = useState('purple')
  const [fontSize, setFontSize] = useState('medium')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load saved preferences from localStorage
    const savedAccent = localStorage.getItem('accentColor') || 'purple'
    const savedFontSize = localStorage.getItem('fontSize') || 'medium'

    setAccentColor(savedAccent)
    setFontSize(savedFontSize)

    // Aplicar cores imediatamente
    applyAccentColor(savedAccent)
  }, [])

  const applyAccentColor = (accent: string) => {
    const root = document.documentElement
    const colorConfig = accentColors.find(c => c.value === accent)

    if (colorConfig && colorConfig.cssVars) {
      Object.entries(colorConfig.cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
      console.log('🎨 Cor de destaque aplicada:', accent)

      // Dispara evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('accentchange', { detail: { accent } }))
    }
  }

  const handleAccentChange = (newAccent: string) => {
    console.log('🎨 Mudando cor de destaque para:', newAccent)
    setAccentColor(newAccent)
    localStorage.setItem('accentColor', newAccent)
    applyAccentColor(newAccent)
  }

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize)

    // Dispatch custom event to notify ThemeInitializer
    window.dispatchEvent(new CustomEvent('fontsizechange', { detail: { fontSize: newSize } }))
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl"></div>
        <div className="h-48 bg-gray-200 rounded-2xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Accent Color */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Cor de Destaque
            </h3>
            <p className="text-sm text-gray-600">
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
                className="group relative cursor-pointer"
                title={color.name}
              >
                <div className={`
                  w-full aspect-square rounded-xl bg-gradient-to-br ${color.color}
                  transition-all group-hover:scale-110 group-hover:shadow-lg
                  ${isSelected ? 'ring-4 ring-gray-400 scale-110' : ''}
                `}>
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-center mt-1 text-gray-600">
                  {color.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Tamanho da Fonte
            </h3>
            <p className="text-sm text-gray-600">
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
                  relative p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-green-500 bg-green-50 ring-4 ring-green-100'
                    : 'border-gray-200 hover:border-green-300'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}

                <div className={`font-semibold text-gray-900 mb-1`} style={{ fontSize: size.scale }}>
                  Aa
                </div>
                <div className="text-sm text-gray-600">
                  {size.name} ({size.scale})
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-primary/30 p-6 border">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Prévia
        </h3>
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary"></div>
            <div>
              <div className="font-semibold text-gray-900">
                Leadgram
              </div>
              <div className="text-sm text-gray-600">
                Fonte {fontSizes.find(f => f.value === fontSize)?.name} • Cor {accentColors.find(c => c.value === accentColor)?.name}
              </div>
            </div>
          </div>
          <p className="text-gray-700">
            Este é um exemplo de como o texto aparecerá com as suas configurações de aparência.
          </p>
          <button className="btn-primary w-full shadow-lg hover:shadow-xl transition-all">
            Botão de Exemplo
          </button>
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-lg bg-primary"></div>
            <div className="w-8 h-8 rounded-lg bg-accent"></div>
            <span className="text-sm text-gray-600">← Suas cores de destaque</span>
          </div>
        </div>
      </div>
    </div>
  )
}
