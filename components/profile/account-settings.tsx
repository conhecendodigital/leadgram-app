'use client'

import { motion } from 'framer-motion'
import { Shield, Bell, Lock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { showToast } from '@/lib/toast'

interface AccountSettingsProps {
  user: any
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({ ...notifications, [key]: value })
    showToast.success('Preferências atualizadas!')
  }

  const handleDeleteAccount = () => {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível!')) {
      showToast.error('Funcionalidade em desenvolvimento')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Configurações da Conta
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Segurança e privacidade
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Notificações</h4>
            </div>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receber notificações por email
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notificações no navegador
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => handleNotificationChange('push', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">SMS</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receber SMS importantes
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Segurança</h4>
            </div>

            <button
              onClick={() => showToast.custom('Funcionalidade em breve', '🔐')}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">Alterar Senha</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Última alteração há 3 meses
              </p>
            </button>

            <button
              onClick={() => showToast.custom('Funcionalidade em breve', '🔒')}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">Autenticação de Dois Fatores</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adicionar camada extra de segurança
              </p>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Danger Zone */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="font-semibold text-red-600 dark:text-red-400">Zona de Perigo</h4>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium transition-colors"
            >
              Excluir Conta Permanentemente
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
