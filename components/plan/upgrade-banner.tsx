'use client'

import { m } from 'framer-motion'
import { Zap, Crown, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UpgradeBannerProps {
  type: 'ideas' | 'posts'
  current: number
  limit: number
  planType: string
  variant?: 'warning' | 'blocked'
}

export default function UpgradeBanner({
  type,
  current,
  limit,
  planType,
  variant = 'warning',
}: UpgradeBannerProps) {
  const percentage = Math.round((current / limit) * 100)
  const isBlocked = current >= limit

  const typeLabels = {
    ideas: 'ideias',
    posts: 'posts sincronizados',
  }

  const upgradePlans = {
    free: { next: 'Pro', icon: Zap, color: 'purple' },
    pro: { next: 'Premium', icon: Crown, color: 'orange' },
    premium: { next: null, icon: Crown, color: 'orange' },
  }

  const plan = upgradePlans[planType as keyof typeof upgradePlans] || upgradePlans.free
  const Icon = plan.icon

  if (plan.next === null) {
    return null // Premium já é o plano máximo
  }

  const isWarningLevel = percentage >= 80 && percentage < 100
  const showBanner = isWarningLevel || isBlocked

  if (!showBanner) return null

  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl p-4 border
        ${isBlocked
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`
          p-2 rounded-lg
          ${isBlocked ? 'bg-red-100' : 'bg-amber-100'}
        `}>
          {isBlocked ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>

        <div className="flex-1">
          <h4 className={`font-semibold mb-1 ${isBlocked ? 'text-red-900' : 'text-amber-900'}`}>
            {isBlocked
              ? `Limite de ${typeLabels[type]} atingido`
              : `Você está perto do limite de ${typeLabels[type]}`
            }
          </h4>

          <p className={`text-sm mb-3 ${isBlocked ? 'text-red-700' : 'text-amber-700'}`}>
            {isBlocked
              ? `Seu plano ${planType.charAt(0).toUpperCase() + planType.slice(1)} permite ${limit} ${typeLabels[type]} por mês. Faça upgrade para continuar.`
              : `Você usou ${current} de ${limit} ${typeLabels[type]} (${percentage}%). Considere fazer upgrade.`
            }
          </p>

          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${isBlocked ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <Link
            href="/dashboard/settings?tab=plan"
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${isBlocked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            Fazer upgrade para {plan.next}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </m.div>
  )
}
