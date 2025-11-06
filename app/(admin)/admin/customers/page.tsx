import { createServerClient } from '@/lib/supabase/server'
import CustomersTable from '@/components/admin/customers-table'
import CustomersStats from '@/components/admin/customers-stats'
import { Users } from 'lucide-react'

export default async function AdminCustomersPage() {
  const supabase = await createServerClient()

  // Buscar todos os usuários (exceto admin)
  const { data: users } = await (supabase
    .from('profiles') as any)
    .select('*, user_subscriptions(*)')
    .neq('email', 'matheussss.afiliado@gmail.com')
    .order('created_at', { ascending: false })

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

      <CustomersStats users={users || []} />
      <CustomersTable users={users || []} />
    </div>
  )
}
