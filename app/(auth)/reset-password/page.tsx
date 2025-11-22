'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Lock, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react'
import AuthFooter from '@/components/auth/footer'

// Component que usa useSearchParams (precisa estar dentro de Suspense)
function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  // Step 1: Verificar código OTP
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpId, setOtpId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 2: Redefinir senha
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Estados gerais
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  // Focar no primeiro input ao carregar
  useEffect(() => {
    const firstInput = document.getElementById('code-0')
    if (firstInput) {
      firstInput.focus()
    }
  }, [])

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
      handleVerifyOTP(newCode.join(''))
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
      handleVerifyOTP(pastedData)
    }
  }

  const handleVerifyOTP = async (codeToVerify?: string) => {
    const codeString = codeToVerify || code.join('')

    if (codeString.length !== 6) {
      setError('Por favor, digite o código completo de 6 dígitos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: codeString,
          purpose: 'password_reset'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Código inválido')
      }

      // Código verificado com sucesso
      setOtpVerified(true)
      setOtpId(result.otpId)
      setUserId(result.userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código')
      setCode(['', '', '', '', '', '']) // Limpar código
      const firstInput = document.getElementById('code-0')
      if (firstInput) firstInput.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validação de senha
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (!userId) {
      setError('Sessão inválida. Tente novamente.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Atualizar senha usando o service role (via API)
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword: password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao redefinir senha')
      }

      setSuccess(true)

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2000)
    } catch (err) {
      console.error('Erro ao redefinir senha:', err)
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setError(null)

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: 'password_reset'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao reenviar código')
      }

      // Limpar código e focar no primeiro input
      setCode(['', '', '', '', '', ''])
      const firstInput = document.getElementById('code-0')
      if (firstInput) firstInput.focus()
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Senha redefinida!</h2>
            <p className="text-gray-600 mb-4">Sua senha foi alterada com sucesso.</p>
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    )
  }

  // Tela de redefinição de senha (após verificar OTP)
  if (otpVerified) {
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
            <p className="text-sm sm:text-base text-gray-600">Redefinir senha</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Código verificado!</h2>
              <p className="text-gray-600 text-sm">
                Agora defina sua nova senha
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Nova senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
              </div>

              {/* Confirmar senha */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </button>
            </form>

            <AuthFooter />
          </div>
        </div>
      </div>
    )
  }

  // Tela de verificação de OTP
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
          <p className="text-sm sm:text-base text-gray-600">Recuperação de senha</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Digite o código</h2>
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
              onClick={() => handleVerifyOTP()}
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
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Não recebeu o código?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="text-primary font-medium text-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                'Reenviar código'
              )}
            </button>
          </div>

          {/* Voltar */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Voltar
            </Link>
          </div>

          <AuthFooter />
        </div>
      </div>
    </div>
  )
}

// Componente principal com Suspense boundary
export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  )
}
