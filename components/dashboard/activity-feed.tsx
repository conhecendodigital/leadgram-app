import { Clock, CheckCircle, Video, Upload } from 'lucide-react'

export default function ActivityFeed() {
  const activities = [
    {
      icon: CheckCircle,
      text: 'Vídeo "Dicas de SEO" postado',
      time: 'Há 2 horas',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Video,
      text: 'Vídeo "Tutorial React" gravado',
      time: 'Há 5 horas',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Upload,
      text: '3 novas ideias adicionadas',
      time: 'Ontem',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Atividade Recente</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${activity.bg}`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.text}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
        Ver tudo
      </button>
    </div>
  )
}
