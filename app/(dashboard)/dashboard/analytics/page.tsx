import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Redirecionar para submenu apropriado
  const { data: instagramAccounts } = await supabase
    .from('instagram_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)

  // Se tem Instagram, vai para analytics do Instagram
  if (instagramAccounts && instagramAccounts.length > 0) {
    redirect('/dashboard/analytics/instagram')
  }

  // Senão, vai para analytics de ideias
  redirect('/dashboard/analytics/ideias')
}
