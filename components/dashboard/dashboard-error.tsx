'use client'

import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface DashboardErrorProps {
  error?: Error | string
  reset?: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const errorMessage = typeof error === 'string'
    ? error
    : error?.message || 'Ocorreu um erro ao carregar o dashboard'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          {/* Ícone de erro */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ops! Algo deu errado
          </h2>

          {/* Mensagem de erro */}
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>

          {/* Detalhes técnicos (expandível) */}
          {error && typeof error !== 'string' && (
            <details className="mb-6">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
                Ver detalhes técnicos
              </summary>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <pre className="text-xs text-gray-700 overflow-auto">
                  {error.stack || error.toString()}
                </pre>
              </div>
            </details>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            {reset && (
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
            )}

            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Ir para início
            </Link>
          </div>

          {/* Ajuda */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
