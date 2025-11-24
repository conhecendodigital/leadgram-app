'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import AuthFooter from '@/components/auth/footer'
import OTPInput from '@/components/auth/otp-input'
import { ERROR_MESSAGES, OTP_PURPOSES, RESEND_COUNTDOWN_SECONDS } from '@/lib/constants/auth'

// Component que usa useSearchParams (precisa estar dentro de Suspense)
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [success, setSuccess] = useState(false)

  const handleVerifyCode = async (code: string) => {
    const supabase = createClient()

    // Verificar código OTP diretamente no client (cria sessão automaticamente)
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })

    if (verifyError) {
      console.error('❌ Erro ao verificar OTP:', verifyError)

      // Traduzir erros comuns do Supabase
      let errorMsg = ERROR_MESSAGES.OTP_INVALID
      if (verifyError.message.includes('expired')) {
        errorMsg = ERROR_MESSAGES.OTP_EXPIRED
      } else if (verifyError.message.includes('invalid')) {
        errorMsg = ERROR_MESSAGES.OTP_INCORRECT
      } else if (verifyError.message.includes('not found')) {
        errorMsg = ERROR_MESSAGES.OTP_NOT_FOUND
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
          code,
          purpose: 'email_verification'
        })
      })
    } catch (apiError) {
      console.error('Erro ao marcar email como verificado:', apiError)
      // Não bloquear o fluxo se falhar
    }

    // Marcar dispositivo como confiável
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
  }

  const handleResendCode = async () => {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        purpose: OTP_PURPOSES.EMAIL_VERIFICATION
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao reenviar código')
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
          <OTPInput
            email={email}
            title="Verifique seu email"
            description="Enviamos um código de 6 dígitos para"
            onComplete={handleVerifyCode}
            onResend={handleResendCode}
            enableResendCountdown
            resendCountdownSeconds={RESEND_COUNTDOWN_SECONDS}
          />

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
