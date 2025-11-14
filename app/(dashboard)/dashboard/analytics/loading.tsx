export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl sm:rounded-2xl animate-pulse"></div>
            <div className="h-8 sm:h-10 bg-gray-200 rounded w-32 sm:w-40 animate-pulse"></div>
          </div>
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-48 sm:w-64 animate-pulse"></div>
        </div>
      </div>

      {/* Botão Atualizar Skeleton */}
      <div className="flex justify-end">
        <div className="h-10 bg-gray-200 rounded-xl w-full sm:w-32 animate-pulse"></div>
      </div>

      {/* Cards de Métricas Principais Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="h-9 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Métricas Diárias Médias Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-28 mt-1 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Melhor Horário e Dia Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="text-center py-4">
              <div className="h-16 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-40 mx-auto animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Posts Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-56 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Gráfico Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="h-6 bg-gray-200 rounded w-56 mb-6 animate-pulse"></div>
        <div className="h-64 flex items-end justify-between gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-200 rounded-t animate-pulse"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
