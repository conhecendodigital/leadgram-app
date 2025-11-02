'use client'

import { useState } from 'react'
import { Lock, Download, Trash2, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Users, Database } from 'lucide-react'

export default function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('private')
  const [shareAnalytics, setShareAnalytics] = useState(false)
  const [showInSearch, setShowInSearch] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleExportData = async () => {
    setExporting(true)
    try {
      // Simulate API call to export data
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create download link (in production, download actual data)
      const data = {
        profile: {},
        ideas: [],
        analytics: {},
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leadgram-data-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETAR MINHA CONTA') {
      alert('Por favor, digite "DELETAR MINHA CONTA" para confirmar')
      return
    }

    try {
      // In production, call API to delete account
      const response = await fetch('/api/settings/account/delete', {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Conta deletada com sucesso. Você será redirecionado.')
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Erro ao deletar conta. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Visibilidade do Perfil
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Controle quem pode ver seu perfil
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setProfileVisibility('public')}
            className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${profileVisibility === 'public'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-4 ring-purple-100 dark:ring-purple-900/50'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <Eye className={`w-5 h-5 ${profileVisibility === 'public' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`} />
              <div className="font-semibold text-gray-900 dark:text-white">
                Público
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Qualquer pessoa pode ver seu perfil
            </div>
          </button>

          <button
            onClick={() => setProfileVisibility('private')}
            className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${profileVisibility === 'private'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-4 ring-purple-100 dark:ring-purple-900/50'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <EyeOff className={`w-5 h-5 ${profileVisibility === 'private' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`} />
              <div className="font-semibold text-gray-900 dark:text-white">
                Privado
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Apenas você pode ver seu perfil
            </div>
          </button>
        </div>
      </div>

      {/* Data Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Privacidade de Dados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie como seus dados são usados
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Compartilhar Análises Anônimas
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Ajude a melhorar o produto compartilhando dados anônimos
                </div>
              </div>
            </div>
            <button
              onClick={() => setShareAnalytics(!shareAnalytics)}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${shareAnalytics
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
            >
              <div className={`
                absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                ${shareAnalytics ? 'translate-x-6' : 'translate-x-0'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Aparecer em Buscas
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Permitir que seu perfil apareça em resultados de busca
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInSearch(!showInSearch)}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${showInSearch
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
            >
              <div className={`
                absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                ${showInSearch ? 'translate-x-6' : 'translate-x-0'}
              `} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Exportar Dados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Baixe uma cópia de todos os seus dados
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Seus dados incluem:</strong> perfil, ideias salvas, análises do Instagram,
              configurações e histórico de uso. O arquivo será enviado em formato JSON.
            </div>
          </div>
        </div>

        <button
          onClick={handleExportData}
          disabled={exporting}
          className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Exportar Meus Dados
            </>
          )}
        </button>
      </div>

      {/* Delete Account */}
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-300">
              Zona de Perigo
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              Ações irreversíveis
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Deletar Conta Permanentemente
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong className="text-red-600 dark:text-red-400">Atenção!</strong> Esta ação é permanente e não pode ser desfeita.
                  Todos os seus dados serão deletados:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Perfil e configurações</li>
                    <li>Ideias salvas</li>
                    <li>Análises e métricas</li>
                    <li>Histórico de uso</li>
                    <li>Assinatura ativa</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Digite "DELETAR MINHA CONTA" para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETAR MINHA CONTA"
                className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETAR MINHA CONTA'}
                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Confirmar Exclusão
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Info */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-purple-200 dark:border-gray-600 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-purple-600 dark:text-purple-400">Sua privacidade é importante!</strong>
            <p className="mt-2">
              Nós levamos a segurança dos seus dados a sério. Todos os dados são criptografados
              e armazenados com segurança. Nunca compartilhamos suas informações pessoais sem
              sua permissão explícita.
            </p>
            <a
              href="/privacy-policy"
              className="inline-block mt-3 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Leia nossa Política de Privacidade →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
