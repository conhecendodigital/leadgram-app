'use client'

import { motion } from 'framer-motion'
import { Mail, Calendar, CreditCard, MoreVertical } from 'lucide-react'

interface CustomersTableProps {
  users: any[]
}

export default function CustomersTable({ users }: CustomersTableProps) {
  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { bg: 'bg-gray-100', text: 'text-gray-600' },
      pro: { bg: 'bg-purple-100', text: 'text-primary' },
      premium: { bg: 'bg-pink-100', text: 'text-primary' },
    }
    return badges[plan as keyof typeof badges] || badges.free
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-600' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-600' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">
          Todos os Clientes
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie e visualize todos os usuários da plataforma
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plano
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cadastro
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user, index) => {
              const subscription = user.user_subscriptions?.[0]
              const plan = subscription?.plan_type || 'free'
              const status = subscription?.status || 'active'
              const planBadge = getPlanBadge(plan)
              const statusBadge = getStatusBadge(status)

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.full_name || 'Sem nome'}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${planBadge.bg} ${planBadge.text}`}>
                      {plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                      {status === 'active' ? 'Ativo' : status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum cliente cadastrado ainda
          </div>
        )}
      </div>
    </motion.div>
  )
}
