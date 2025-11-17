export default function AdminPaymentsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 bg-gray-200 rounded-lg w-56 animate-pulse mb-2" />
        <div className="h-5 bg-gray-200 rounded-lg w-80 animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse mb-1" />
            <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-56 animate-pulse" />
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-3 bg-gray-200 rounded w-28 animate-pulse" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-40 animate-pulse" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-36 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
