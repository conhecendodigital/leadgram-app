import { createServerClient } from '@/lib/supabase/server'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default async function AdminPaymentsPage() {
  const supabase = await createServerClient()

  // Buscar todos os pagamentos com informações do usuário
  const { data: payments } = await (supabase
    .from('payments') as any)
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  // Calcular estatísticas
  const totalRevenue = payments?.reduce((sum: number, p: any) => {
    if (p.status === 'approved' || p.status === 'authorized') {
      return sum + (parseFloat(p.amount) || 0)
    }
    return sum
  }, 0) || 0

  const pendingPayments = payments?.filter((p: any) =>
    p.status === 'pending' || p.status === 'in_process'
  ).length || 0

  const successfulPayments = payments?.filter((p: any) =>
    p.status === 'approved' || p.status === 'authorized'
  ).length || 0

  const failedPayments = payments?.filter((p: any) =>
    p.status === 'rejected' || p.status === 'cancelled'
  ).length || 0

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Pagamentos
        </h1>
        <p className="text-gray-600">
          Histórico e gerenciamento de pagamentos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Receita Total
          </p>
          <p className="text-3xl font-bold text-gray-900">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Pagamentos Aprovados
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {successfulPayments}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Pendentes
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {pendingPayments}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Taxa de Sucesso
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {payments?.length ? ((successfulPayments / payments.length) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Histórico de Pagamentos
          </h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments && payments.length > 0 ? (
                payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500">
                      Nenhum pagamento registrado ainda
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
