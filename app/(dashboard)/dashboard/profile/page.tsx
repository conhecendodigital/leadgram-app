import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileHeader from '@/components/profile/profile-header'
import ProfileSettings from '@/components/profile/profile-settings'
import AccountSettings from '@/components/profile/account-settings'
import { User } from 'lucide-react'

// Forçar renderização dinâmica para sempre buscar dados atualizados
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl">
            <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Perfil
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Gerencie suas informações e preferências
        </p>
      </div>

      <ProfileHeader user={user} profile={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ProfileSettings profile={profile} />
        <AccountSettings user={user} />
      </div>
    </div>
  )
}
