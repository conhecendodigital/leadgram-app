export default function Loading() {
  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-200 rounded-xl md:rounded-2xl animate-pulse"></div>
          <div className="h-8 md:h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-5 md:h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>

      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="space-y-2 mb-4">
              <div className="h-5 bg-gray-200 rounded w-56 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="flex gap-2 justify-center md:justify-start">
              <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50">
                <div className="h-8 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
