'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { CheckCircle, CreditCard, ExternalLink, Key, AlertCircle, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface MercadoPagoConnectionProps {
  connection: any
}

export default function MercadoPagoConnection({ connection: initialConnection }: MercadoPagoConnectionProps) {
  const [connection, setConnection] = useState(initialConnection)
  const [accessToken, setAccessToken] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [testMode, setTestMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  // Validação de formato das credenciais
  const validateCredentials = () => {
    setError(null)

    if (!accessToken || !publicKey) {
      setError('Preencha todos os campos')
      return false
    }

    // Validar formato Access Token (APP_USR- ou TEST-)
    if (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-')) {
      setError('Access Token deve começar com APP_USR- ou TEST-')
      return false
    }

    // Validar formato Public Key (APP_USR- ou TEST-)
    if (!publicKey.startsWith('APP_USR-') && !publicKey.startsWith('TEST-')) {
      setError('Public Key deve começar com APP_USR- ou TEST-')
      return false
    }

    return true
  }

  const handleConnect = async () => {
    if (!validateCredentials()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/mercadopago/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          publicKey,
          testMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao conectar')
      }

      showToast.success('Mercado Pago conectado com sucesso!')

      // Atualizar estado ao invés de reload
      setConnection(data.connection)
      setAccessToken('')
      setPublicKey('')
    } catch (error: any) {
      setError(error.message)
      showToast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/mercadopago/disconnect', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao desconectar')
      }

      showToast.success('Mercado Pago desconectado com sucesso!')

      // Atualizar estado
      setConnection(null)
      setShowDisconnectConfirm(false)
    } catch (error: any) {
      setError(error.message)
      showToast.error(error.message)
    } finally {
      setDisconnecting(false)
    }
  }

  if (connection) {
    return (
      <>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
        >
          {/* Error Banner */}
          {error && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Fechar
              </button>
            </m.div>
          )}

          <div className="flex items-start gap-4">
            <div className="p-4 bg-green-50 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Mercado Pago Conectado
              </h3>
              <p className="text-gray-600 mb-6">
                Sua conta está conectada e pronta para receber pagamentos
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">
                    {connection.email || 'Não disponível'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Conectado em</p>
                  <p className="font-medium text-gray-900">
                    {new Date(connection.connected_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Modo</p>
                  <p className="font-medium text-gray-900">
                    {connection.test_mode ? 'Teste' : 'Produção'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-medium text-green-600">
                    Ativo
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  disabled={disconnecting}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Desconectar
                </button>
                <a
                  href="https://www.mercadopago.com.br/developers/panel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary hover:bg-blue-100 rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Painel MP
                </a>
              </div>
            </div>
          </div>
        </m.div>

        {/* Disconnect Confirmation Modal */}
        <AnimatePresence>
          {showDisconnectConfirm && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDisconnectConfirm(false)}
            >
              <m.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Desconectar Mercado Pago?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ao desconectar, você não poderá mais receber pagamentos até reconectar sua conta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    disabled={disconnecting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {disconnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {disconnecting ? 'Desconectando...' : 'Desconectar'}
                  </button>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-50 rounded-2xl mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Conectar Mercado Pago
          </h3>
          <p className="text-gray-600">
            Configure suas credenciais para começar a receber pagamentos
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 hover:text-red-900 font-medium"
            >
              Fechar
            </button>
          </m.div>
        )}

        {/* Alert */}
        <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Como obter suas credenciais:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Acesse <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" className="underline">developers.mercadopago.com.br</a></li>
              <li>Faça login com sua conta</li>
              <li>Vá em "Suas integrações" → "Credenciais"</li>
              <li>Copie o Access Token e Public Key</li>
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={accessToken}
                onChange={(e) => {
                  setAccessToken(e.target.value)
                  setError(null)
                }}
                placeholder="APP_USR-... ou TEST-..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={publicKey}
                onChange={(e) => {
                  setPublicKey(e.target.value)
                  setError(null)
                }}
                placeholder="APP_USR-... ou TEST-..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="testMode"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="testMode" className="text-sm font-medium text-gray-700">
              Modo de Teste (use credenciais de teste)
            </label>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Conectando...' : 'Conectar Mercado Pago'}
          </button>
        </div>
      </div>
    </m.div>
  )
}
