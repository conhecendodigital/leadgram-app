'use client'

import { useState, useEffect } from 'react'

interface AppSettings {
  [key: string]: any
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      const data = await response.json()
      setSettings(data.settings || {})
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao carregar configurações:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar configuração')
      }

      // Recarregar configurações após atualizar
      await fetchSettings()
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar configuração:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }
    }
  }

  const updateSettings = async (newSettings: Record<string, any>) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar configurações')
      }

      const data = await response.json()

      // Recarregar configurações após atualizar
      await fetchSettings()
      return { success: true, message: data.message }
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateSetting,
    updateSettings,
    refetch: fetchSettings,
  }
}
