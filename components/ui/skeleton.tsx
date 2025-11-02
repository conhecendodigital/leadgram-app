import { motion } from 'framer-motion'

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`}
    />
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <Skeleton className="w-12 h-12 mb-4" />
      <Skeleton className="w-24 h-8 mb-2" />
      <Skeleton className="w-32 h-4" />
    </div>
  )
}

export function ContentGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <Skeleton className="w-48 h-6 mb-4" />
      <Skeleton className="w-full h-64" />
    </div>
  )
}

export function ActivityFeedSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="w-32 h-4 mb-1" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TopContentSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="w-32 h-4 mb-1" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StoriesCarouselSkeleton() {
  return (
    <div className="mt-6">
      <Skeleton className="w-32 h-6 mb-4" />
      <div className="flex gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="w-24 h-24 rounded-2xl mb-2" />
            <Skeleton className="w-24 h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
