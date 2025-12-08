'use client'

import { Lock, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

interface PremiumFeatureLockProps {
  title: string
  description?: string
  requiredPlan?: 'pro' | 'premium'
  children?: React.ReactNode
  blur?: boolean
}

export default function PremiumFeatureLock({
  title,
  description,
  requiredPlan = 'pro',
  children,
  blur = true,
}: PremiumFeatureLockProps) {
  const planInfo = {
    pro: {
      name: 'Pro',
      icon: Zap,
      color: 'purple',
      price: 'R$ 49',
    },
    premium: {
      name: 'Premium',
      icon: Crown,
      color: 'orange',
      price: 'R$ 99',
    },
  }

  const plan = planInfo[requiredPlan]
  const Icon = plan.icon

  return (
    <div className="relative">
      {/* Conteúdo bloqueado com blur */}
      {children && blur && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="blur-sm opacity-50 pointer-events-none">
            {children}
          </div>
        </div>
      )}

      {/* Overlay de bloqueio */}
      <div className={`${children && blur ? 'absolute inset-0' : ''} flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8`}>
        <div className="text-center max-w-sm">
          <div className={`
            inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
            ${requiredPlan === 'pro' ? 'bg-purple-100' : 'bg-orange-100'}
          `}>
            <Lock className={`w-8 h-8 ${requiredPlan === 'pro' ? 'text-purple-600' : 'text-orange-600'}`} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {title}
          </h3>

          {description && (
            <p className="text-gray-600 text-sm mb-4">
              {description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon className={`w-5 h-5 ${requiredPlan === 'pro' ? 'text-purple-600' : 'text-orange-600'}`} />
            <span className="text-sm text-gray-600">
              Disponível no plano <strong>{plan.name}</strong> ({plan.price}/mês)
            </span>
          </div>

          <Link
            href="/dashboard/settings?tab=plan"
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90
              ${requiredPlan === 'pro'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                : 'bg-gradient-to-r from-orange-500 to-pink-600'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            Fazer upgrade para {plan.name}
          </Link>
        </div>
      </div>
    </div>
  )
}
