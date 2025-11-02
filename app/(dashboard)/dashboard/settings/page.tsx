import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon } from 'lucide-react'
import SettingsTabs from '@/components/settings/settings-tabs'

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Buscar profile com tratamento de erro
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  // Buscar subscription com tratamento de erro
  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError)
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl">
            <SettingsIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Configurações
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Gerencie sua conta, preferências e assinatura
        </p>
      </div>

      {/* Settings Tabs */}
      <SettingsTabs user={session.user} profile={profile} subscription={subscription} />
    </div>
  )
}
