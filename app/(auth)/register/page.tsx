'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, User, Loader2 } from 'lucide-react'
import AuthFooter from '@/components/auth/footer'
import { PASSWORD_MIN_LENGTH, ERROR_MESSAGES, OTP_PURPOSES } from '@/lib/constants/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validar senhas
    if (password !== confirmPassword) {
      setError(ERROR_MESSAGES.PASSWORD_MISMATCH)
      setLoading(false)
      return
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Criar usuário SEM confirmação de email automática
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // NÃO enviar email de confirmação do Supabase
          emailRedirectTo: undefined,
        },
      })

      if (signUpError) {
        console.error('Erro no signUp:', signUpError)

        // Traduzir mensagens de erro do Supabase
        if (signUpError.message.includes('already registered')) {
          throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
        }
        if (signUpError.message.includes('Invalid email')) {
          throw new Error(ERROR_MESSAGES.EMAIL_INVALID)
        }
        if (signUpError.message.includes('Password')) {
          throw new Error(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
        }

        throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR)
      }

      // Verificar se o usuário foi criado
      if (!data.user) {
        throw new Error('Erro ao criar usuário')
      }

      // ✅ Perfil criado AUTOMATICAMENTE pelo trigger handle_new_user()
      // O trigger executa após INSERT em auth.users e cria o perfil em profiles

      // Enviar código OTP para verificação de email
      try {
        const otpResponse = await fetch('/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            purpose: OTP_PURPOSES.EMAIL_VERIFICATION,
            userId: data.user.id
          })
        })

        if (!otpResponse.ok) {
          const errorData = await otpResponse.json()
          console.error('Erro ao enviar OTP:', errorData)

          // Redirecionar para página de verificação mesmo com erro
          // O usuário poderá tentar reenviar o código de lá
          router.push(`/verify-email?email=${encodeURIComponent(email)}&error=send_failed`)
          return
        }

        // Redirecionar para página de verificação OTP
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      } catch (otpError) {
        console.error('Erro ao enviar OTP:', otpError)
        // Redirecionar para página de verificação mesmo com erro
        // O usuário poderá tentar reenviar o código de lá
        router.push(`/verify-email?email=${encodeURIComponent(email)}&error=send_failed`)
      }
    } catch (err) {
      console.error('Erro ao criar conta:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Criar nova conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="João Silva"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Mínimo de {PASSWORD_MIN_LENGTH} caracteres</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:opacity-90 transition-colors"
            >
              Fazer login
            </Link>
          </p>

          <AuthFooter />
        </div>
      </div>
    </div>
  )
}
