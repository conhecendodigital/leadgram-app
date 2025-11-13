export default function ChartSkeleton() {
  return (
    <div className="w-full h-full animate-pulse">
      <div className="flex flex-col space-y-3">
        {/* Header skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>

        {/* Chart area skeleton */}
        <div className="flex items-end space-x-2 h-48">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>

        {/* Legend skeleton */}
        <div className="flex justify-center space-x-4">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}
