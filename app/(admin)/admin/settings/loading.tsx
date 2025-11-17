export default function AdminSettingsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 bg-gray-200 rounded-lg w-56 animate-pulse mb-2" />
        <div className="h-5 bg-gray-200 rounded-lg w-80 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-2">
            <nav className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Title */}
            <div className="mb-6">
              <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-2" />
              <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse" />
            </div>

            {/* Settings Items */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-gray-200"
                >
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-40 animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Stats Grid Skeleton (for Database/Email tabs) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Button Skeleton */}
            <div className="pt-4 mt-6 border-t border-gray-200">
              <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
