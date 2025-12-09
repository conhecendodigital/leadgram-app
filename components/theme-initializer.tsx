'use client'

import { useEffect } from 'react'

export default function ThemeInitializer() {
  useEffect(() => {
    // Apply settings from localStorage on mount
    const applySettings = () => {
      const fontSize = localStorage.getItem('fontSize') || 'medium'
      const theme = localStorage.getItem('theme') || 'light'
      const root = document.documentElement

      // Apply font size
      const sizes: Record<string, string> = { small: '14px', medium: '16px', large: '18px' }
      root.style.fontSize = sizes[fontSize] || '16px'

      // Apply theme
      applyTheme(theme)
    }

    const applyTheme = (themeValue: string) => {
      const root = document.documentElement

      if (themeValue === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
      } else {
        root.classList.toggle('dark', themeValue === 'dark')
      }
    }

    applySettings()

    // Listen for theme changes
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: string }>
      applyTheme(customEvent.detail.theme)
    }

    // Listen for font size changes
    const handleFontSizeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ fontSize: string }>
      const fontSize = customEvent.detail.fontSize
      const root = document.documentElement
      const sizes: Record<string, string> = { small: '14px', medium: '16px', large: '18px' }
      root.style.fontSize = sizes[fontSize] || '16px'
    }

    // Listen for system theme changes (when using 'system' option)
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const theme = localStorage.getItem('theme')
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }

    window.addEventListener('themechange', handleThemeChange)
    window.addEventListener('fontsizechange', handleFontSizeChange)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      window.removeEventListener('themechange', handleThemeChange)
      window.removeEventListener('fontsizechange', handleFontSizeChange)
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  return null
}
