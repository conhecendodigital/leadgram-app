export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-2xl p-6 h-32" />
        </div>
      ))}
    </div>
  )
}
