'use client'

export default function AutomationsClient() {
  return (
    <div className="space-y-6">
      {/* Placeholder - Página de Automações */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Automações
          </h2>

          <p className="text-gray-600 mb-6">
            Em breve você terá acesso a poderosas automações para gerenciar seu conteúdo e engajamento de forma automática.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            Em desenvolvimento
          </div>
        </div>
      </div>
    </div>
  )
}
