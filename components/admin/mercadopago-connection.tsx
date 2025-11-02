'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, CreditCard, ExternalLink, Key, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface MercadoPagoConnectionProps {
  connection: any
}

export default function MercadoPagoConnection({ connection }: MercadoPagoConnectionProps) {
  const [accessToken, setAccessToken] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [testMode, setTestMode] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!accessToken || !publicKey) {
      showToast.error('Preencha todos os campos')
      return
    }

    setLoading(true)

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
      window.location.reload()
    } catch (error: any) {
      showToast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (connection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mercado Pago Conectado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sua conta está conectada e pronta para receber pagamentos
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {connection.email || 'Não disponível'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conectado em</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(connection.connected_at).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Modo</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {connection.test_mode ? 'Teste' : 'Produção'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  Ativo
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-medium transition-colors">
                Desconectar
              </button>
              <a
                href="https://www.mercadopago.com.br/developers/panel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Painel MP
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Conectar Mercado Pago
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure suas credenciais para começar a receber pagamentos
          </p>
        </div>

        {/* Alert */}
        <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Token
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="APP_USR-..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Public Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="APP_USR-..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <input
              type="checkbox"
              id="testMode"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="testMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Modo de Teste (use credenciais de teste)
            </label>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Conectando...' : 'Conectar Mercado Pago'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
