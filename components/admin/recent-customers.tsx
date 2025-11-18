'use client'

import { m } from 'framer-motion'
import { Users, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
// Email do admin (movido de lib/roles.ts para evitar import server-side em client component)
const ADMIN_EMAIL = 'matheussss.afiliado@gmail.com'

export default function RecentCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)

        // Buscar profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .neq('email', ADMIN_EMAIL)
          .order('created_at', { ascending: false })
          .limit(5)

        if (profilesData && profilesData.length > 0) {
          const userIds = profilesData.map(p => p.id)

          // Buscar subscriptions
          const { data: subscriptions } = await supabase
            .from('user_subscriptions')
            .select('*')
            .in('user_id', userIds)

          // Mapear subscriptions para os profiles
          const customersWithSubscriptions = profilesData.map(profile => ({
            ...profile,
            subscriptions: subscriptions?.filter(s => s.user_id === profile.id) || []
          }))

          setCustomers(customersWithSubscriptions)
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: 'bg-gray-100 text-gray-600',
      pro: 'bg-purple-100 text-primary',
      premium: 'bg-pink-100 text-primary',
    }
    return badges[plan as keyof typeof badges] || badges.free
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Clientes Recentes
          </h3>
          <p className="text-sm text-gray-600">
            Últimos cadastros
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-40 animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              </div>
            ))}
          </>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Nenhum cliente cadastrado ainda</p>
          </div>
        ) : (
          customers.map((customer, index) => (
            <m.div
              key={customer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {customer.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {customer.full_name || customer.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${getPlanBadge(
                    customer.subscriptions?.[0]?.plan_type || 'free'
                  )}`}
                >
                  {customer.subscriptions?.[0]?.plan_type?.toUpperCase() || 'FREE'}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </m.div>
          ))
        )}
      </div>
    </m.div>
  )
}
