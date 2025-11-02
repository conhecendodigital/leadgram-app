import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileHeader from '@/components/explore/profile-header'
import ProfileStats from '@/components/explore/profile-stats'
import TopPosts from '@/components/explore/top-posts'
import EngagementChart from '@/components/explore/engagement-chart'
import ContentFilters from '@/components/explore/content-filters'
import CompareButton from '@/components/explore/compare-button'
import { instagramAPI } from '@/lib/instagram-api'

async function getProfileData(username: string) {
  try {
    // Buscar perfil e posts em paralelo
    const [profile, posts] = await Promise.all([
      instagramAPI.getProfile(username),
      instagramAPI.getUserPosts(username, 50),
    ])

    return {
      ...profile,
      posts,
    }
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return null
  }
}

export default async function ProfileAnalysisPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { username } = await params
  const profileData = await getProfileData(username)

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Perfil não encontrado
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Não foi possível carregar o perfil @{username}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Profile Header */}
      <ProfileHeader profile={profileData} />

      {/* Stats Overview */}
      <ProfileStats profile={profileData} />

      {/* Engagement Chart */}
      <EngagementChart posts={profileData.posts} />

      {/* Content Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Publicações ({profileData.posts.length})
          </h2>
          <div className="flex gap-3">
            <ContentFilters />
            <CompareButton username={username} />
          </div>
        </div>

        <TopPosts posts={profileData.posts} />
      </div>
    </div>
  )
}
