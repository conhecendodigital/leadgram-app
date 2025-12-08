'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PlanLimits {
  planType: string
  subscription: string
  limits: {
    ideas: {
      limit: number
      current: number
      remaining: number | 'unlimited'
      percentage: number
      canCreate: boolean
    }
    posts: {
      limit: number
      current: number
      remaining: number | 'unlimited'
      percentage: number
      canPost: boolean
    }
  }
}

interface UsePlanLimitsReturn {
  limits: PlanLimits | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  canCreateIdea: boolean
  canSyncPost: boolean
  isUnlimited: (type: 'ideas' | 'posts') => boolean
  getUsageText: (type: 'ideas' | 'posts') => string
}

export function usePlanLimits(): UsePlanLimitsReturn {
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/limits')

      if (!response.ok) {
        throw new Error('Erro ao buscar limites')
      }

      const data = await response.json()

      if (data.success) {
        setLimits(data)
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLimits()
  }, [fetchLimits])

  const canCreateIdea = limits?.limits.ideas.canCreate ?? true
  const canSyncPost = limits?.limits.posts.canPost ?? true

  const isUnlimited = useCallback((type: 'ideas' | 'posts'): boolean => {
    if (!limits) return false
    return limits.limits[type].limit === -1
  }, [limits])

  const getUsageText = useCallback((type: 'ideas' | 'posts'): string => {
    if (!limits) return ''

    const data = limits.limits[type]

    if (data.limit === -1) {
      return `${data.current} (ilimitado)`
    }

    return `${data.current}/${data.limit}`
  }, [limits])

  return {
    limits,
    loading,
    error,
    refetch: fetchLimits,
    canCreateIdea,
    canSyncPost,
    isUnlimited,
    getUsageText,
  }
}
