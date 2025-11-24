'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import AuthFooter from '@/components/auth/footer'

// Component que usa useSearchParams (precisa estar dentro de Suspense)
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Focar no primeiro input ao carregar
  useEffect(() => {
    const firstInput = document.getElementById('code-0')
    if (firstInput) {
      firstInput.focus()
    }
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

    // Auto-focar no próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }

    // Auto-verificar quando todos os 6 dígitos forem preenchidos
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    // Verificar se são 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('')
      setCode(newCode)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeToVerify?: string) => {
    const codeString = codeToVerify || code.join('')

    if (codeString.length !== 6) {
      setError('Por favor, digite o código completo de 6 dígitos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Verificar código OTP diretamente no client (cria sessão automaticamente)
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: codeString,
        type: 'email'
      })

      if (verifyError) {
        console.error('❌ Erro ao verificar OTP:', verifyError)

        // Traduzir erros comuns do Supabase
        let errorMsg = 'Código inválido ou expirado'
        if (verifyError.message.includes('expired')) {
          errorMsg = 'Este código expirou. Por favor, solicite um novo código.'
        } else if (verifyError.message.includes('invalid')) {
          errorMsg = 'Código inválido. Verifique se digitou corretamente.'
        } else if (verifyError.message.includes('not found')) {
          errorMsg = 'Código não encontrado. Solicite um novo código.'
        }

        throw new Error(errorMsg)
      }

      if (!data.user) {
        throw new Error('Erro ao verificar código')
      }

      console.log('✅ Email verificado e sessão criada com sucesso!')

      // Marcar email como verificado no perfil (via API)
      try {
        await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            code: codeString,
            purpose: 'email_verification'
          })
        })
      } catch (apiError) {
        console.error('Erro ao marcar email como verificado:', apiError)
        // Não bloquear o fluxo se falhar
      }

      // Marcar dispositivo como confiável (email verificado = dispositivo verificado)
      try {
        await fetch('/api/auth/trust-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (trustError) {
        console.error('Erro ao marcar dispositivo como confiável:', trustError)
        // Não bloquear o fluxo se falhar
      }

      setSuccess(true)

      // Redirecionar para dashboard após 1.5 segundos
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código')
      setCode(['', '', '', '', '', '']) // Limpar código
      const firstInput = document.getElementById('code-0')
      if (firstInput) firstInput.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    setResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: 'email_verification'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao reenviar código')
      }

      // Mostrar mensagem de sucesso e iniciar countdown
      setResendSuccess(true)
      setCode(['', '', '', '', '', ''])
      setCanResend(false)
      setResendCountdown(60) // 60 segundos de espera

      const firstInput = document.getElementById('code-0')
      if (firstInput) firstInput.focus()

      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setResendSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar código')
    } finally {
      setResending(false)
    }
  }

  // Tela de sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email verificado!</h2>
            <p className="text-gray-600 mb-4">Sua conta foi confirmada com sucesso.</p>
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Redirecionando para o dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Leadgram
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Gerenciamento de conteúdo para criadores</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Verifique seu email</h2>
            <p className="text-gray-600 text-sm">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-primary font-semibold mt-1">{email}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-600 text-sm">Código reenviado com sucesso! Verifique seu email.</p>
            </div>
          )}

          {/* Código OTP */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
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
          </div>

          {/* Reenviar código */}
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

          {/* Voltar */}
          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Voltar para cadastro
            </Link>
          </div>

          <AuthFooter />
        </div>
      </div>
    </div>
  )
}

// Componente principal com Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
