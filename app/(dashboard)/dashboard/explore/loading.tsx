export default function Loading() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-200 rounded-xl md:rounded-2xl animate-pulse"></div>
          <div className="h-8 md:h-10 bg-gray-200 rounded w-48 md:w-64 animate-pulse"></div>
        </div>
        <div className="h-5 md:h-6 bg-gray-200 rounded w-64 md:w-80 animate-pulse"></div>
      </div>

      {/* Search Form Skeleton */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
          <div className="space-y-4">
            {/* Label */}
            <div className="h-4 bg-gray-200 rounded w-56 mb-2 animate-pulse"></div>

            {/* Input */}
            <div className="h-14 bg-gray-50 border border-gray-200 rounded-xl animate-pulse"></div>

            {/* Button */}
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Examples Skeleton */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="h-7 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-2 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
