'use client'

import { m, AnimatePresence } from 'framer-motion'
import { Mail, Calendar, CreditCard, MoreVertical, Eye, Edit, Ban, Trash2, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

interface CustomersTableProps {
  users: any[]
}

export default function CustomersTable({ users }: CustomersTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [displayLimit, setDisplayLimit] = useState(10)

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase()
    return users.filter((user) => {
      const name = (user.full_name || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [users, searchQuery])

  // Aplicar limite de exibição
  const displayedUsers = useMemo(() => {
    return filteredUsers.slice(0, displayLimit)
  }, [filteredUsers, displayLimit])

  const hasMore = filteredUsers.length > displayLimit

  const loadMore = () => {
    setDisplayLimit(prev => prev + 10)
  }
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
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Todos os Clientes
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Exibindo {displayedUsers.length} de {filteredUsers.length} {searchQuery ? 'resultados' : 'clientes'}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
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
            {displayedUsers.map((user, index) => {
              const subscription = user.subscriptions?.[0]
              const plan = subscription?.plan_type || 'free'
              const status = subscription?.status || 'active'
              const planBadge = getPlanBadge(plan)
              const statusBadge = getStatusBadge(status)

              return (
                <m.tr
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
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>

                      <AnimatePresence>
                        {openDropdown === user.id && (
                          <>
                            {/* Backdrop to close dropdown */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />

                            {/* Dropdown Menu */}
                            <m.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20"
                            >
                              <button
                                onClick={() => {
                                  alert(`Ver detalhes de ${user.email}`)
                                  setOpenDropdown(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                                Ver Detalhes
                              </button>

                              <button
                                onClick={() => {
                                  alert(`Editar ${user.email}`)
                                  setOpenDropdown(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Edit className="w-4 h-4 text-purple-600" />
                                Editar Cliente
                              </button>

                              <button
                                onClick={() => {
                                  alert(`Desativar ${user.email}`)
                                  setOpenDropdown(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Ban className="w-4 h-4 text-orange-600" />
                                Desativar
                              </button>

                              <div className="border-t border-gray-100 my-1" />

                              <button
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja deletar ${user.email}?`)) {
                                    alert(`Deletar ${user.email}`)
                                  }
                                  setOpenDropdown(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Deletar Cliente
                              </button>
                            </m.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </m.tr>
              )
            })}
          </tbody>
        </table>

        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum cliente cadastrado ainda
          </div>
        ) : filteredUsers.length === 0 && searchQuery ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="font-medium">Nenhum resultado encontrado</p>
            <p className="text-sm mt-1">
              Tente buscar com outro termo
            </p>
          </div>
        ) : null}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={loadMore}
            className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all"
          >
            Carregar mais {Math.min(10, filteredUsers.length - displayLimit)} clientes
          </button>
        </div>
      )}
    </m.div>
  )
}
