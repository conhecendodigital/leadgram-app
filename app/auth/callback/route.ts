import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { DeviceVerificationService } from '@/lib/services/device-verification-service'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Marcar dispositivo como confiável após confirmação de email ou OAuth
    if (data.user) {
      try {
        await DeviceVerificationService.trustCurrentDevice(data.user.id)
        console.log('✅ Dispositivo marcado como confiável após callback:', data.user.email)
      } catch (error) {
        console.error('Erro ao marcar dispositivo como confiável:', error)
        // Não bloquear o fluxo se falhar
      }
    }
  }

  // Redirecionar para o dashboard após OAuth
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
