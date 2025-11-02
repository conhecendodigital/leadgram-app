import { createServerClient } from '@/lib/supabase/server'
import MercadoPagoConnection from '@/components/admin/mercadopago-connection'
import { CreditCard } from 'lucide-react'

export default async function AdminMercadoPagoPage() {
  const supabase = createServerClient()

  // Buscar conexão do admin
  const { data: connection } = await (supabase
    .from('admin_mercadopago') as any)
    .select('*')
    .eq('is_active', true)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Mercado Pago
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Conecte sua conta para receber pagamentos dos clientes
        </p>
      </div>

      <MercadoPagoConnection connection={connection} />
    </div>
  )
}
