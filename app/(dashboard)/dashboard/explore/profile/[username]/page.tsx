import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileHeader from '@/components/explore/profile-header'
import ProfileStats from '@/components/explore/profile-stats'
import TopPosts from '@/components/explore/top-posts'
import EngagementChart from '@/components/explore/engagement-chart'
import { AlertCircle } from 'lucide-react'

async function getProfileData(username: string) {
  try {
    // Chamar API interna que usa RapidAPI
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const [profileRes, postsRes] = await Promise.all([
      fetch(`${baseUrl}/api/instagram/profile?username=${username}`, {
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/instagram/posts?username=${username}&count=50`, {
        cache: 'no-store',
      }),
    ])

    if (!profileRes.ok) {
      return null
    }

    if (!postsRes.ok) {
      return null
    }

    const profile = await profileRes.json()
    const { posts } = await postsRes.json()

    return {
      ...profile,
      posts: posts || [],
    }
  } catch (error) {
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
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { username } = await params
  const profileData = await getProfileData(username)

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-red-900 mb-2">
                Perfil não encontrado
              </h2>
              <p className="text-sm text-red-800">
                Não foi possível carregar o perfil <strong>@{username}</strong>
              </p>
              <p className="text-sm text-red-700 mt-2">
                Possíveis causas:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside mt-1 space-y-1">
                <li>Perfil privado ou inexistente</li>
                <li>API RapidAPI não configurada</li>
                <li>Limite de requisições atingido</li>
              </ul>
            </div>
          </div>
        </div>

        <a
          href="/dashboard/explore"
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors"
        >
          ← Voltar
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <ProfileHeader profile={profileData} />
      <ProfileStats profile={profileData} />
      {profileData.posts && profileData.posts.length > 0 && (
        <>
          <EngagementChart posts={profileData.posts} />
          <TopPosts posts={profileData.posts} />
        </>
      )}
    </div>
  )
}
