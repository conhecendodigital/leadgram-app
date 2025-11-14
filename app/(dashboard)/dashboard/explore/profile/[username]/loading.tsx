export default function Loading() {
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Picture */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse"></div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="h-8 md:h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-16 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Profile Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Engagement Chart Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="h-6 bg-gray-200 rounded w-56 mb-6 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Top Posts Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
