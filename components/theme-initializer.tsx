'use client'

import { useEffect } from 'react'

export default function ThemeInitializer() {
  useEffect(() => {
    // Apply colors from localStorage on mount
    const applyColors = () => {
      const accent = localStorage.getItem('accentColor') || 'purple'
      const fontSize = localStorage.getItem('fontSize') || 'medium'
      const root = document.documentElement

      const colors: Record<string, any> = {
        purple: { primary: '139 92 246', accent: '139 92 246', ring: '139 92 246' },
        blue: { primary: '59 130 246', accent: '59 130 246', ring: '59 130 246' },
        green: { primary: '34 197 94', accent: '34 197 94', ring: '34 197 94' },
        orange: { primary: '249 115 22', accent: '249 115 22', ring: '249 115 22' },
        pink: { primary: '236 72 153', accent: '236 72 153', ring: '236 72 153' },
        indigo: { primary: '99 102 241', accent: '99 102 241', ring: '99 102 241' }
      }

      const colorConfig = colors[accent] || colors.purple
      root.style.setProperty('--primary', colorConfig.primary)
      root.style.setProperty('--accent', colorConfig.accent)
      root.style.setProperty('--ring', colorConfig.ring)

      const sizes: Record<string, string> = { small: '14px', medium: '16px', large: '18px' }
      root.style.fontSize = sizes[fontSize] || '16px'
    }

    applyColors()

    // Listen for accent color changes
    const handleAccentChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ accent: string }>
      const accent = customEvent.detail.accent
      const root = document.documentElement

      const colors: Record<string, any> = {
        purple: { primary: '139 92 246', accent: '139 92 246', ring: '139 92 246' },
        blue: { primary: '59 130 246', accent: '59 130 246', ring: '59 130 246' },
        green: { primary: '34 197 94', accent: '34 197 94', ring: '34 197 94' },
        orange: { primary: '249 115 22', accent: '249 115 22', ring: '249 115 22' },
        pink: { primary: '236 72 153', accent: '236 72 153', ring: '236 72 153' },
        indigo: { primary: '99 102 241', accent: '99 102 241', ring: '99 102 241' }
      }

      const colorConfig = colors[accent] || colors.purple
      root.style.setProperty('--primary', colorConfig.primary)
      root.style.setProperty('--accent', colorConfig.accent)
      root.style.setProperty('--ring', colorConfig.ring)

      console.log('🎨 Cor de destaque alterada para:', accent)
    }

    // Listen for font size changes
    const handleFontSizeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ fontSize: string }>
      const fontSize = customEvent.detail.fontSize
      const root = document.documentElement
      const sizes: Record<string, string> = { small: '14px', medium: '16px', large: '18px' }
      root.style.fontSize = sizes[fontSize] || '16px'
    }

    window.addEventListener('accentchange', handleAccentChange)
    window.addEventListener('fontsizechange', handleFontSizeChange)

    return () => {
      window.removeEventListener('accentchange', handleAccentChange)
      window.removeEventListener('fontsizechange', handleFontSizeChange)
    }
  }, [])

  return null
}
