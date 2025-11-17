export default function AdminPlansLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse mb-2" />
        <div className="h-5 bg-gray-200 rounded-lg w-80 animate-pulse" />
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
            <div className="h-9 bg-gray-200 rounded w-16 animate-pulse mb-1" />
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Plans Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-200 p-6 animate-pulse">
              <div className="h-7 bg-gray-300 rounded w-24 mb-2" />
              <div className="flex items-baseline gap-1">
                <div className="h-10 bg-gray-300 rounded w-28" />
                <div className="h-6 bg-gray-300 rounded w-16" />
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                <div className="h-7 bg-gray-200 rounded w-12 animate-pulse" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse mb-1" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </div>

            {/* Features */}
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mt-0.5" />
                    <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
