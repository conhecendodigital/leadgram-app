export default function Loading() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-200 rounded-xl md:rounded-2xl animate-pulse"></div>
          <div className="h-8 md:h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-5 md:h-6 bg-gray-200 rounded w-72 animate-pulse"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded-xl animate-pulse"
              style={{ minWidth: '120px' }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content Skeleton - Profile Tab Style */}
      <div className="space-y-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                <div className="w-14 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 - Grid Style */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
