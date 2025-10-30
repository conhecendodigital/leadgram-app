'use client'

import { useState, useEffect } from 'react'
import { Instagram, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export default function InstagramConnect() {
  const [loading, setLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(true)

  useEffect(() => {
    // Verificar se as variáveis de ambiente estão configuradas
    const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI

    if (!appId || !redirectUri) {
      setIsConfigured(false)
    }
  }, [])

  const handleConnect = async () => {
    if (!isConfigured) {
      alert('Instagram não está configurado. Verifique o arquivo INSTAGRAM_SETUP.md')
      return
    }

    setLoading(true)
    try {
      // Redirecionar para a API de autenticação do Instagram
      window.location.href = '/api/instagram/auth'
    } catch (error) {
      console.error('Error connecting Instagram:', error)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      {/* Aviso de configuração */}
      {!isConfigured && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-1">Instagram não configurado</h4>
            <p className="text-sm text-yellow-800 mb-2">
              As variáveis de ambiente do Instagram não estão configuradas.
            </p>
            <p className="text-xs text-yellow-700">
              Consulte o arquivo <code className="bg-yellow-100 px-1 py-0.5 rounded">INSTAGRAM_SETUP.md</code> para instruções completas.
            </p>
          </div>
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Instagram className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Conectar conta do Instagram
        </h2>
        <p className="text-gray-600 mb-8">
          Sincronize automaticamente as métricas dos seus posts do Instagram e acompanhe o desempenho do seu conteúdo
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          {[
            'Sincronização automática de métricas',
            'Acompanhamento de engajamento',
            'Análise de performance por post',
            'Histórico completo de dados',
          ].map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 mx-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Instagram className="w-5 h-5" />
              Conectar com Instagram
            </>
          )}
        </button>

        {/* Info */}
        <p className="mt-6 text-xs text-gray-500">
          Ao conectar, você autoriza o Leadgram a acessar suas métricas públicas do Instagram.
          Seus dados estão seguros e nunca serão compartilhados.
        </p>

        {/* Debug Info - Apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-600 mb-1">🔧 Debug Info:</p>
            <div className="text-xs font-mono text-gray-500 space-y-1">
              <div>App ID: {process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ? '✅ Configurado' : '❌ Não configurado'}</div>
              <div>Redirect URI: {process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ? '✅ Configurado' : '❌ Não configurado'}</div>
              <div className="mt-2 text-gray-400">
                Se aparecer "❌", configure o .env.local
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
