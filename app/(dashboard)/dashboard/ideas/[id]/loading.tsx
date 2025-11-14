export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              </div>
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-full max-w-lg mb-2 animate-pulse"></div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none h-10 bg-gray-200 rounded-xl w-full sm:w-24 animate-pulse"></div>
              <div className="flex-1 sm:flex-none h-10 bg-gray-200 rounded-xl w-full sm:w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>

        {/* Media Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4 sm:mb-6">
          <div className="aspect-video bg-gray-200 animate-pulse"></div>
        </div>

        {/* Metrics Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Platforms Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j}>
                      <div className="h-4 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
