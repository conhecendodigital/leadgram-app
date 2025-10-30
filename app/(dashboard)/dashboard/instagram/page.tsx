'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import InstagramConnect from '@/components/instagram/instagram-connect'
import InstagramAccount from '@/components/instagram/instagram-account'

interface InstagramAccountData {
  id: string
  username: string
  followers_count: number
  follows_count: number
  media_count: number
  profile_picture_url: string | null
  last_sync_at: string | null
}

export default function InstagramPage() {
  const [account, setAccount] = useState<InstagramAccountData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccount()
  }, [])

  const fetchAccount = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (data) {
        setAccount(data)
      }
    } catch (error) {
      console.error('Error fetching Instagram account:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-pulse">
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integração Instagram</h1>
          <p className="text-gray-600">
            Conecte sua conta do Instagram para sincronizar métricas automaticamente
          </p>
        </div>

        {account ? (
          <InstagramAccount account={account} onDisconnect={() => setAccount(null)} />
        ) : (
          <InstagramConnect />
        )}
      </div>
    </div>
  )
}
