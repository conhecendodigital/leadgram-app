export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 bg-gray-200 rounded-lg w-56 animate-pulse mb-2" />
        <div className="h-5 bg-gray-200 rounded-lg w-80 animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Notifications List Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full animate-pulse" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
                        <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                      <div className="h-6 bg-gray-200 rounded-full w-32 animate-pulse" />
                    </div>
                    <div className="flex-shrink-0 w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                  </div>

                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />

                  <div className="flex items-center gap-4">
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
