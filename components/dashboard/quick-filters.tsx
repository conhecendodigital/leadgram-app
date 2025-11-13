'use client'

import { m } from 'framer-motion'
import { Filter, Calendar, CheckCircle, Video, Lightbulb } from 'lucide-react'

export type StatusFilterType = 'all' | 'idea' | 'recorded' | 'posted'
export type PeriodFilterType = '7' | '30' | 'all'

interface QuickFiltersProps {
  statusFilter: StatusFilterType
  periodFilter: PeriodFilterType
  onStatusChange: (status: StatusFilterType) => void
  onPeriodChange: (period: PeriodFilterType) => void
}

export default function QuickFilters({
  statusFilter,
  periodFilter,
  onStatusChange,
  onPeriodChange,
}: QuickFiltersProps) {
  const statusOptions = [
    { value: 'all' as const, label: 'Todos', icon: Filter },
    { value: 'idea' as const, label: 'Ideias', icon: Lightbulb },
    { value: 'recorded' as const, label: 'Gravados', icon: Video },
    { value: 'posted' as const, label: 'Postados', icon: CheckCircle },
  ]

  const periodOptions = [
    { value: '7' as const, label: '7 dias' },
    { value: '30' as const, label: '30 dias' },
    { value: 'all' as const, label: 'Tudo' },
  ]

  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Status Filter */}
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon
              const isActive = statusFilter === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => onStatusChange(option.value)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all
                    ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-200" />

        {/* Period Filter */}
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-600 mb-2 block flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Período
          </label>
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => {
              const isActive = periodFilter === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => onPeriodChange(option.value)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm transition-all
                    ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </m.div>
  )
}
