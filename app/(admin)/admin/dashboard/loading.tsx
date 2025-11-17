export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 bg-gray-200 rounded-lg w-80 animate-pulse mb-2" />
        <div className="h-5 bg-gray-200 rounded-lg w-64 animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-7 w-16 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-9 bg-gray-200 rounded w-24 animate-pulse mb-1" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>

      {/* Activity and Customers Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div
                  key={j}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
