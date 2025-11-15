import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon } from 'lucide-react'
import SettingsTabs from '@/components/settings/settings-tabs'

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Buscar profile com tratamento de erro
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Buscar subscription com tratamento de erro
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl">
            <SettingsIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Configurações
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Gerencie sua conta, preferências e assinatura
        </p>
      </div>

      {/* Settings Tabs */}
      <SettingsTabs user={user} profile={profile} subscription={subscription} />
    </div>
  )
}
