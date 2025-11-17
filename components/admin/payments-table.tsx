'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, X, DollarSign, MoreVertical, Eye, Download, RotateCcw, AlertCircle } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'

interface PaymentsTableProps {
  payments: any[]
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  const [displayLimit, setDisplayLimit] = useState(15)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Filtrar pagamentos
  const filteredPayments = useMemo(() => {
    let filtered = [...payments]

    // Filtro de busca por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((payment) => {
        const name = (payment.profiles?.full_name || '').toLowerCase()
        const email = (payment.profiles?.email || '').toLowerCase()
        const paymentId = (payment.mercadopago_payment_id || '').toLowerCase()
        return name.includes(query) || email.includes(query) || paymentId.includes(query)
      })
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    // Filtro de método
    if (methodFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.payment_method === methodFilter)
    }

    // Filtro de período
    if (periodFilter !== 'all') {
      const now = new Date()
      const days = parseInt(periodFilter)
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((payment) => new Date(payment.created_at) >= startDate)
    }

    return filtered
  }, [payments, searchQuery, statusFilter, methodFilter, periodFilter])

  // Aplicar limite de exibição
  const displayedPayments = useMemo(() => {
    return filteredPayments.slice(0, displayLimit)
  }, [filteredPayments, displayLimit])

  const hasMore = filteredPayments.length > displayLimit

  const loadMore = () => {
    setDisplayLimit(prev => prev + 15)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setMethodFilter('all')
    setPeriodFilter('all')
    setDisplayLimit(15)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || methodFilter !== 'all' || periodFilter !== 'all'

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprovado' },
      authorized: { bg: 'bg-green-100', text: 'text-green-700', label: 'Autorizado' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
      in_process: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processando' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeitado' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelado' },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Histórico de Pagamentos
            </h2>
            <p className="text-sm text-gray-600">
              Exibindo {displayedPayments.length} de {filteredPayments.length} {hasActiveFilters ? 'resultados' : 'pagamentos'}
            </p>
          </div>

          {/* Filters Section */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou ID do pagamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="all">Todos os Status</option>
                <option value="approved">Aprovado</option>
                <option value="authorized">Autorizado</option>
                <option value="pending">Pendente</option>
                <option value="in_process">Processando</option>
                <option value="rejected">Rejeitado</option>
                <option value="cancelled">Cancelado</option>
              </select>

              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="all">Todos os Métodos</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
              </select>

              {/* Period Filter */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="all">Todos os Períodos</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID Pagamento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedPayments.length > 0 ? (
                displayedPayments.map((payment: any, index: number) => (
                  <m.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.profiles?.full_name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.profiles?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 font-mono">
                        {payment.mercadopago_payment_id || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">
                        R$ {parseFloat(payment.amount || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600 capitalize">
                        {payment.payment_method || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === payment.id ? null : payment.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        <AnimatePresence>
                          {openDropdown === payment.id && (
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
                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20"
                              >
                                <button
                                  onClick={() => {
                                    alert(`Ver detalhes do pagamento: ${payment.mercadopago_payment_id}`)
                                    setOpenDropdown(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                  Ver Detalhes Completos
                                </button>

                                {(payment.status === 'approved' || payment.status === 'authorized') && (
                                  <>
                                    <button
                                      onClick={() => {
                                        alert(`Baixar recibo do pagamento: ${payment.mercadopago_payment_id}`)
                                        setOpenDropdown(null)
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Download className="w-4 h-4 text-green-600" />
                                      Baixar Recibo
                                    </button>

                                    <div className="border-t border-gray-100 my-1" />

                                    <button
                                      onClick={() => {
                                        if (confirm(`Tem certeza que deseja solicitar reembolso para ${payment.profiles?.email}?`)) {
                                          alert(`Reembolso solicitado para: ${payment.mercadopago_payment_id}`)
                                        }
                                        setOpenDropdown(null)
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                      Solicitar Reembolso
                                    </button>
                                  </>
                                )}

                                {(payment.status === 'pending' || payment.status === 'in_process') && (
                                  <button
                                    onClick={() => {
                                      alert(`Verificar status do pagamento: ${payment.mercadopago_payment_id}`)
                                      setOpenDropdown(null)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                                    Verificar Status
                                  </button>
                                )}
                              </m.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </m.tr>
                ))
              ) : !hasActiveFilters && payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-4">
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-gray-900 font-medium mb-2">
                        Nenhum pagamento registrado
                      </p>
                      <p className="text-sm text-gray-500 max-w-md">
                        Pagamentos aparecerão aqui quando clientes assinarem planos ou realizarem compras na plataforma.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <button
            onClick={loadMore}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm hover:shadow-md"
          >
            Carregar mais {Math.min(15, filteredPayments.length - displayLimit)} pagamentos
          </button>
        </div>
      )}

      {/* No Results Message */}
      {filteredPayments.length === 0 && hasActiveFilters && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium mb-1">Nenhum resultado encontrado</p>
          <p className="text-sm text-gray-500 mb-4">
            Tente ajustar os filtros para ver mais resultados
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </>
  )
}
