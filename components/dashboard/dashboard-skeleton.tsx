'use client'

import { m } from 'framer-motion'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="h-9 bg-gray-200 rounded-lg w-64 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded-lg w-48 animate-pulse" />
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-40 animate-pulse" />
        </div>
      </div>

      {/* Quick Filters Skeleton */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse" />
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          </m.div>
        ))}
      </div>

      {/* Stories Carousel Skeleton */}
      <div className="mb-6">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Chart Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Platform Comparison Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-56 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Insights Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-4 md:space-y-6">
          {/* Top Content Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Posts Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
