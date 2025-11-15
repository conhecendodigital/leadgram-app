'use client'

import { useState } from 'react'
import { X, Shield, Download, Check, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'
import Image from 'next/image'

interface Setup2FAModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Step = 'scan' | 'verify' | 'backup'

export default function Setup2FAModal({ isOpen, onClose, onSuccess }: Setup2FAModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('scan')
  const [qrCode, setQRCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')

  const handleStartSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao configurar 2FA')
      }

      setQRCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setStep('scan')
    } catch (error: any) {
      showToast.error(error.message || 'Erro ao configurar 2FA')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (verificationCode.length !== 6) {
      showToast.error('O código deve ter 6 dígitos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationCode,
          secret: secret,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido')
      }

      showToast.success('2FA ativado com sucesso!')
      setStep('backup')
    } catch (error: any) {
      showToast.error(error.message || 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBackupCodes = () => {
    const text = `CÓDIGOS DE BACKUP - LEADGRAM 2FA\n\n${backupCodes.join('\n')}\n\nGuarde estes códigos em um local seguro!\nCada código pode ser usado apenas uma vez.`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leadgram-2fa-backup-codes-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast.success('Códigos de backup baixados!')
  }

  const handleFinish = () => {
    onSuccess?.()
    onClose()
  }

  if (!isOpen) return null

  // Iniciar setup quando abre o modal
  if (!qrCode && !loading) {
    handleStartSetup()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Autenticação de Dois Fatores
                </h2>
                <p className="text-sm text-gray-600">
                  {step === 'scan' && 'Escaneie o QR Code'}
                  {step === 'verify' && 'Verifique o código'}
                  {step === 'backup' && 'Códigos de backup'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Loading */}
          {loading && !qrCode && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Configurando 2FA...</p>
            </div>
          )}

          {/* Step 1: Scan QR Code */}
          {step === 'scan' && qrCode && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Passo 1:</strong> Baixe um aplicativo autenticador como{' '}
                    <strong>Google Authenticator</strong> ou <strong>Authy</strong> no seu celular.
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center py-6">
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 mb-4">
                  {qrCode && (
                    <Image
                      src={qrCode}
                      alt="QR Code 2FA"
                      width={200}
                      height={200}
                      className="w-48 h-48"
                    />
                  )}
                </div>

                <div className="w-full max-w-sm">
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    Ou insira manualmente este código:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-center font-mono text-sm text-gray-900 break-all">
                      {secret}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full py-3 gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <strong>Passo 2:</strong> Digite o código de 6 dígitos que aparece no seu aplicativo autenticador.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 text-center text-2xl font-mono tracking-wider"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('scan')}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 px-4 py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Backup Codes */}
          {step === 'backup' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <strong>Importante:</strong> Guarde estes códigos em um local seguro! Você pode usá-los para acessar sua conta caso perca acesso ao aplicativo autenticador.
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Códigos de Backup ({backupCodes.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-2 font-mono text-sm text-gray-900 text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Baixar Códigos
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 px-4 py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
