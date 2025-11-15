'use client'

import { m } from 'framer-motion'
import { Shield, Lock, Key } from 'lucide-react'
import { useState } from 'react'
import ChangePasswordModal from '@/components/modals/change-password-modal'
import Setup2FAModal from '@/components/modals/setup-2fa-modal'

interface AccountSettingsProps {
  user: any
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  return (
    <>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Segurança da Conta
            </h3>
            <p className="text-sm text-gray-600">
              Gerencie a segurança e acesso da sua conta
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-gray-900">Informações da Conta</h4>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.email || 'Não disponível'}
                  </p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Verificado
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            {/* Security Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-gray-900">Opções de Segurança</h4>
              </div>

              {/* Change Password */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      Alterar Senha
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Atualize sua senha periodicamente para maior segurança
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>

              {/* 2FA */}
              <button
                onClick={() => setShow2FAModal(true)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      Autenticação de Dois Fatores (2FA)
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {is2FAEnabled
                        ? 'Adicione uma camada extra de segurança (Ativo)'
                        : 'Adicione uma camada extra de segurança'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {is2FAEnabled && (
                      <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Ativo
                      </div>
                    )}
                    <Shield className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Dicas de Segurança:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use senhas fortes e únicas</li>
                  <li>Ative a autenticação de dois fatores</li>
                  <li>Nunca compartilhe sua senha</li>
                  <li>Mantenha seu email atualizado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </m.div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <Setup2FAModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onSuccess={() => setIs2FAEnabled(true)}
      />
    </>
  )
}
