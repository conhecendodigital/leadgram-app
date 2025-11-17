import { createServerClient } from '@/lib/supabase/server'
import ReportsDashboard from '@/components/admin/reports-dashboard'

export default async function AdminReportsPage() {
  const supabase = await createServerClient()

  // Buscar dados para relatórios
  const { data: subscriptions } = await (supabase
    .from('user_subscriptions') as any)
    .select('*')
    .order('created_at', { ascending: false })

  const { data: payments } = await (supabase
    .from('payments') as any)
    .select('*')
    .order('created_at', { ascending: false })

  const { count: totalUsers } = await (supabase
    .from('profiles') as any)
    .select('*', { count: 'exact', head: true })

  return (
    <ReportsDashboard
      initialData={{
        subscriptions: subscriptions || [],
        payments: payments || [],
        totalUsers: totalUsers || 0,
      }}
    />
  )
}
