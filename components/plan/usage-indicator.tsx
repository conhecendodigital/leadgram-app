'use client'

import { Sparkles, Infinity } from 'lucide-react'

interface UsageIndicatorProps {
  current: number
  limit: number
  label: string
  showProgress?: boolean
  size?: 'sm' | 'md'
}

export default function UsageIndicator({
  current,
  limit,
  label,
  showProgress = true,
  size = 'md',
}: UsageIndicatorProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.round((current / limit) * 100)
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  const getColor = () => {
    if (isUnlimited) return 'text-green-600'
    if (isAtLimit) return 'text-red-600'
    if (isNearLimit) return 'text-amber-600'
    return 'text-gray-600'
  }

  const getBarColor = () => {
    if (isUnlimited) return 'bg-green-500'
    if (isAtLimit) return 'bg-red-500'
    if (isNearLimit) return 'bg-amber-500'
    return 'bg-primary'
  }

  return (
    <div className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-500">{label}</span>
        <span className={`font-medium ${getColor()}`}>
          {isUnlimited ? (
            <span className="flex items-center gap-1">
              {current} <Infinity className="w-4 h-4" />
            </span>
          ) : (
            `${current}/${limit}`
          )}
        </span>
      </div>

      {showProgress && !isUnlimited && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${getBarColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}

      {isUnlimited && (
        <div className="flex items-center gap-1 text-green-600">
          <Sparkles className="w-3 h-3" />
          <span className="text-xs">Ilimitado</span>
        </div>
      )}
    </div>
  )
}
