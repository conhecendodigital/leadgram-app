'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react'
import AuthFooter from '@/components/auth/footer'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceVerificationRequired, setDeviceVerificationRequired] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // ===== NOVA API COM SISTEMA DE SEGURANÇA INTEGRADO =====
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      // Tratar erros com informações de segurança
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit ou IP bloqueado
          throw new Error(result.message || 'Muitas tentativas. Aguarde um momento.')
        }

        // Email não verificado - redirecionar para página de verificação
        if (result.needsVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          return
        }

        // Mostrar tentativas restantes
        if (result.remainingAttempts !== undefined) {
          throw new Error(`${result.error}. Tentativas restantes: ${result.remainingAttempts}`)
        }

        throw new Error(result.error || 'Erro ao fazer login')
      }

      // Verificação de dispositivo necessária
      if (result.requiresDeviceVerification) {
        setDeviceVerificationRequired(true)
        return
      }

      // Login bem-sucedido
      if (result.success && result.user) {
        // Redirecionar direto para dashboard
        // O middleware vai verificar o role e redirecionar se necessário
        if (email === 'matheussss.afiliado@gmail.com') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  // Tela de verificação de dispositivo
  if (deviceVerificationRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Novo dispositivo detectado</h2>
            <p className="text-gray-600 mb-4">
              Por segurança, enviamos um link de verificação para
            </p>
            <p className="text-primary font-semibold mb-6">{email}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-900">
                Clique no link enviado para confirmar este dispositivo e fazer login.
                Não esqueça de verificar sua caixa de spam!
              </p>
            </div>
            <Link
              href="/login"
              onClick={() => setDeviceVerificationRequired(false)}
              className="inline-block py-3 px-6 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Voltar para Login
            </Link>
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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:opacity-90 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:opacity-90 transition-colors"
            >
              Criar conta
            </Link>
          </p>

          <AuthFooter />
        </div>
      </div>
    </div>
  )
}
