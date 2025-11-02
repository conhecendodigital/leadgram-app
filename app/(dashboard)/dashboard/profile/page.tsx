import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileHeader from '@/components/profile/profile-header'
import ProfileSettings from '@/components/profile/profile-settings'
import AccountSettings from '@/components/profile/account-settings'
import { User } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl">
            <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Perfil
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Gerencie suas informações e preferências
        </p>
      </div>

      <ProfileHeader user={session.user} profile={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ProfileSettings profile={profile} />
        <AccountSettings user={session.user} />
      </div>
    </div>
  )
}
