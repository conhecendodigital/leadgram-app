export default function AdminReportsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse mb-2" />
        <div className="h-5 bg-gray-200 rounded-lg w-64 animate-pulse" />
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse mb-4" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-1" />
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Plan Distribution Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-56 animate-pulse mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-20 mx-auto mb-1 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
