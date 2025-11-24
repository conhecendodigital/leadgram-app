'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { OTP_LENGTH, RESEND_COUNTDOWN_SECONDS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/auth'

export interface OTPInputProps {
  /** Callback quando código de 6 dígitos é completado */
  onComplete: (code: string) => Promise<void>
  /** Email para exibir */
  email: string
  /** Callback para reenviar código */
  onResend?: () => Promise<void>
  /** Título da seção */
  title?: string
  /** Descrição da seção */
  description?: string
  /** Habilitar countdown no botão de reenvio */
  enableResendCountdown?: boolean
  /** Segundos de countdown */
  resendCountdownSeconds?: number
  /** Desabilitar auto-verificação ao completar */
  disableAutoVerify?: boolean
}

/**
 * Componente reutilizável para entrada de código OTP de 6 dígitos
 *
 * Features:
 * - Auto-foco nos inputs
 * - Navegação com teclado (setas, backspace)
 * - Suporte a paste de código completo
 * - Auto-verificação ao completar 6 dígitos
 * - Estado de loading
 * - Mensagens de erro/sucesso
 * - Botão de reenviar com countdown opcional
 *
 * @example
 * ```tsx
 * <OTPInput
 *   email="user@example.com"
 *   title="Verificar Email"
 *   description="Digite o código enviado para"
 *   onComplete={async (code) => {
 *     await verifyCode(code)
 *   }}
 *   onResend={async () => {
 *     await resendCode()
 *   }}
 *   enableResendCountdown
 * />
 * ```
 */
export default function OTPInput({
  onComplete,
  email,
  onResend,
  title = 'Digite o código',
  description = 'Enviamos um código de 6 dígitos para',
  enableResendCountdown = true,
  resendCountdownSeconds = RESEND_COUNTDOWN_SECONDS,
  disableAutoVerify = false
}: OTPInputProps) {
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [canResend, setCanResend] = useState(!enableResendCountdown)
  const [resendCountdown, setResendCountdown] = useState(0)

  const inputRefs = useRef<HTMLInputElement[]>([])

  // Focar no primeiro input ao carregar
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Countdown para reenvio
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCountdown])

  const handleCodeChange = (index: number, value: string) => {
    // Permitir apenas números
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError(null)
    setSuccess(null)

    // Auto-focar no próximo input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verificar quando todos os dígitos forem preenchidos
    if (!disableAutoVerify && newCode.every(digit => digit !== '') && index === OTP_LENGTH - 1) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace - voltar para input anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Seta esquerda
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Seta direita
    else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    // Verificar se são OTP_LENGTH dígitos
    const otpRegex = new RegExp(`^\\d{${OTP_LENGTH}}$`)
    if (otpRegex.test(pastedData)) {
      const newCode = pastedData.split('')
      setCode(newCode)
      setError(null)
      setSuccess(null)

      // Focar no último input
      inputRefs.current[OTP_LENGTH - 1]?.focus()

      // Auto-verificar
      if (!disableAutoVerify) {
        handleVerify(pastedData)
      }
    }
  }

  const handleVerify = async (codeToVerify?: string) => {
    const codeString = codeToVerify || code.join('')

    if (codeString.length !== OTP_LENGTH) {
      setError(ERROR_MESSAGES.OTP_INCOMPLETE)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onComplete(codeString)
      setSuccess(SUCCESS_MESSAGES.OTP_VERIFIED)
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.OTP_INVALID)
      setCode(Array(OTP_LENGTH).fill('')) // Limpar código
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend || !onResend) return

    setResending(true)
    setError(null)
    setSuccess(null)

    try {
      await onResend()
      setSuccess(SUCCESS_MESSAGES.OTP_RESENT)
      setCode(Array(OTP_LENGTH).fill(''))
      setCanResend(false)
      setResendCountdown(resendCountdownSeconds)
      inputRefs.current[0]?.focus()

      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
        <p className="text-primary font-semibold mt-1">{email}</p>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Inputs OTP */}
      <div className="mb-6">
        <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { if (el) inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              autoComplete="off"
            />
          ))}
        </div>

        {!disableAutoVerify && (
          <button
            onClick={() => handleVerify()}
            disabled={loading || code.some(d => d === '')}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar código'
            )}
          </button>
        )}
      </div>

      {/* Reenviar código */}
      {onResend && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Não recebeu o código?
          </p>
          <button
            onClick={handleResendCode}
            disabled={resending || !canResend}
            className="text-primary font-medium text-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
          >
            {resending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reenviando...
              </>
            ) : !canResend && resendCountdown > 0 ? (
              `Aguarde ${resendCountdown}s para reenviar`
            ) : (
              'Reenviar código'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
