import { createServerClient } from '@/lib/supabase/server'
import CustomersTable from '@/components/admin/customers-table'
import CustomersStats from '@/components/admin/customers-stats'
import { Users } from 'lucide-react'
import { ADMIN_EMAIL } from '@/lib/roles'

export default async function AdminCustomersPage() {
  const supabase = await createServerClient()

  // Buscar todos os usuários (exceto admin)
  const { data: profilesData, error: profilesError } = await (supabase
    .from('profiles') as any)
    .select('*')
    .neq('email', ADMIN_EMAIL)
    .order('created_at', { ascending: false })

  // Buscar subscriptions para os usuários
  let users = profilesData
  let error = profilesError

  if (profilesData && profilesData.length > 0) {
    const userIds = profilesData.map((p: any) => p.id)

    const { data: subscriptions } = await (supabase
      .from('user_subscriptions') as any)
      .select('*')
      .in('user_id', userIds)

    // Mapear subscriptions para os usuários
    users = profilesData.map((profile: any) => ({
      ...profile,
      subscriptions: subscriptions?.filter((s: any) => s.user_id === profile.id) || []
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Clientes
          </h1>
        </div>
        <p className="text-gray-600">
          Gerencie todos os clientes da plataforma
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Erro ao Carregar Clientes
              </h3>
              <p className="text-sm text-red-700">
                Ocorreu um erro ao buscar os dados dos clientes. Por favor, tente novamente mais tarde.
              </p>
              {error.message && (
                <p className="text-xs text-red-600 mt-2 font-mono">
                  Detalhes: {error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {!error && (
        <>
          <CustomersStats users={users || []} />
          <CustomersTable users={users || []} />
        </>
      )}
    </div>
  )
}
