import type { FunnelStage } from '@/types/idea.types'
import { ArrowDown, ArrowRight, Target } from 'lucide-react'

interface FunnelBadgeProps {
  stage: FunnelStage
}

export default function FunnelBadge({ stage }: FunnelBadgeProps) {
  const config = {
    top: {
      label: 'Topo',
      className: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Target,
    },
    middle: {
      label: 'Meio',
      className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: ArrowDown,
    },
    bottom: {
      label: 'Fundo',
      className: 'bg-pink-100 text-pink-700 border-pink-200',
      icon: ArrowRight,
    },
  }

  const { label, className, icon: Icon } = config[stage]

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
