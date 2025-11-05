'use client'

import { Instagram, AlertCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function InstagramConnect() {
  const [loading, setLoading] = useState(false)

  const handleConnect = () => {
    setLoading(true)
    window.location.href = '/api/instagram/auth'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <div className="text-center max-w-md mx-auto">
        {/* Instagram Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl mb-6 shadow-lg">
          <Instagram className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Conectar Instagram Business
        </h2>
        <p className="text-gray-600 mb-6">
          Sincronize automaticamente seus posts e métricas do Instagram
        </p>

        {/* Requirements Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-2">Requisitos:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Conta Instagram Business ou Creator</li>
                <li>• Página do Facebook conectada</li>
                <li>• Ser admin da página</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              Importação automática de posts
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              Métricas atualizadas em tempo real
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              Analytics detalhados por post
            </span>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full gradient-primary hover:opacity-90 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Instagram className="w-5 h-5" />
              Conectar via Facebook
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Conexão segura via Facebook/Meta
        </p>
      </div>
    </div>
  )
}
