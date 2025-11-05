'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wrench, Loader2 } from 'lucide-react'

export default function MaintenancePage() {
  const [message, setMessage] = useState('Estamos em manutenção. Voltaremos em breve!')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMaintenanceMessage = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'maintenance_message')
          .single()

        if (data?.value) {
          setMessage(data.value)
        }
      } catch (error) {
        console.error('Erro ao buscar mensagem de manutenção:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMaintenanceMessage()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Wrench className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Em Manutenção
        </h1>

        {/* Message */}
        <p className="text-xl text-gray-600">
          {message}
        </p>

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
          <p className="text-sm text-gray-500">
            Estamos trabalhando para melhorar sua experiência.
          </p>
          <p className="text-sm text-gray-500">
            Por favor, tente novamente mais tarde.
          </p>
        </div>

        {/* Contact */}
        <p className="text-sm text-gray-400">
          Dúvidas? Entre em contato:{' '}
          <a
            href="mailto:suporte@leadgram.app"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            suporte@leadgram.app
          </a>
        </p>
      </div>
    </div>
  )
}
