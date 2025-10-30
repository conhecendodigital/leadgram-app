import type { IdeaStatus } from '@/types/idea.types'
import { Lightbulb, Video, CheckCircle2 } from 'lucide-react'

interface StatusBadgeProps {
  status: IdeaStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    idea: {
      label: 'Ideia',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: Lightbulb,
    },
    recorded: {
      label: 'Gravado',
      className: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Video,
    },
    posted: {
      label: 'Postado',
      className: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2,
    },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
