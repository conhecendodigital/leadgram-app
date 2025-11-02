import { createServerClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'user'

// Email do admin (seu email)
export const ADMIN_EMAIL = 'matheussss.afiliado@gmail.com'

export function isAdmin(email: string): boolean {
  return email === ADMIN_EMAIL
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createServerClient()

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('email, role')
    .eq('id', userId)
    .single()

  if (profile?.email === ADMIN_EMAIL || profile?.role === 'admin') {
    return 'admin'
  }

  return 'user'
}
