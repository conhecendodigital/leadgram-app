export default function AdminMercadoPagoLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse" />
        </div>
        <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse" />
      </div>

      {/* Connection Card Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="max-w-2xl mx-auto">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-2 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse" />
          </div>

          {/* Alert Skeleton */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6">
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            {/* Access Token */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-12 bg-gray-50 border border-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Public Key */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-2 animate-pulse" />
              <div className="h-12 bg-gray-50 border border-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
            </div>

            {/* Button */}
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
