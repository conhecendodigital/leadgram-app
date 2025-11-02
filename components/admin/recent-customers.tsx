'use client'

import { motion } from 'framer-motion'
import { Users, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function RecentCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await (supabase
        .from('profiles') as any)
        .select('*, user_subscriptions(*)')
        .neq('email', 'matheussss.afiliado@gmail.com')
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setCustomers(data)
      }
    }

    fetchCustomers()
  }, [])

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
      pro: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      premium: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    }
    return badges[plan as keyof typeof badges] || badges.free
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Clientes Recentes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Últimos cadastros
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {customers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {customer.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {customer.full_name || customer.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {customer.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium ${getPlanBadge(
                  customer.user_subscriptions?.[0]?.plan_type || 'free'
                )}`}
              >
                {customer.user_subscriptions?.[0]?.plan_type?.toUpperCase() || 'FREE'}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(customer.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </motion.div>
        ))}

        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum cliente cadastrado ainda
          </div>
        )}
      </div>
    </motion.div>
  )
}
