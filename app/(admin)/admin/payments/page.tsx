import { createServerClient } from '@/lib/supabase/server'
import PaymentsTable from '@/components/admin/payments-table'
import PaymentsStats from '@/components/admin/payments-stats'

export default async function AdminPaymentsPage() {
  const supabase = await createServerClient()

  // Buscar todos os pagamentos
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })

  // Buscar profiles para os pagamentos
  let payments = paymentsData
  let error = paymentsError

  if (paymentsData && paymentsData.length > 0) {
    const userIds = [...new Set(paymentsData.map(p => p.user_id).filter(Boolean))]

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    // Mapear profiles para os pagamentos
    payments = paymentsData.map(payment => ({
      ...payment,
      user: profiles?.find(p => p.id === payment.user_id) || null
    }))
  }

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
                Erro ao Carregar Pagamentos
              </h3>
              <p className="text-sm text-red-700">
                Ocorreu um erro ao buscar os dados dos pagamentos. Por favor, tente novamente mais tarde.
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
          {/* Stats Grid */}
          <PaymentsStats
            totalRevenue={totalRevenue}
            successfulPayments={successfulPayments}
            pendingPayments={pendingPayments}
            successRate={payments?.length ? ((successfulPayments / payments.length) * 100).toFixed(1) : '0'}
          />

      {/* Payments Table */}
      <PaymentsTable payments={payments || []} />
        </>
      )}
    </div>
  )
}
