import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

/**
 * Hook para gerenciar logout do usuário
 *
 * Centraliza a lógica de logout em um único local,
 * evitando duplicação de código em múltiplos componentes.
 *
 * @returns {Object} - Objeto contendo função logout e estado isLoggingOut
 *
 * @example
 * ```tsx
 * const { logout, isLoggingOut } = useLogout()
 *
 * <button onClick={logout} disabled={isLoggingOut}>
 *   {isLoggingOut ? 'Saindo...' : 'Sair'}
 * </button>
 * ```
 */
export function useLogout() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async () => {
    try {
      setIsLoggingOut(true)

      // 1. Chamar API de logout (limpa sessões no servidor)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      // 2. Logout local (limpa cookies do Supabase)
      const supabase = createClient()
      await supabase.auth.signOut()

      // 3. Redirecionar para login
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, tentar redirecionar para login
      router.push('/login')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return { logout, isLoggingOut }
}
