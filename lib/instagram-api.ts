// Service para integrar com RapidAPI Instagram Scraper
// Com timeout, retry e error handling melhorado
//
// IMPORTANTE: Este código está configurado para usar a API "Instagram Scraper API2"
// Host: instagram-scraper-api2.p.rapidapi.com
// Endpoints: v1.2/user-info, v1.2/user-posts, v1.2/hashtag-posts
//
// Se você estiver usando uma API diferente do Instagram na RapidAPI,
// você precisará ajustar os endpoints nos métodos getProfile(), getUserPosts() e getTopPostsByHashtag()

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST!

// Timeout de 30 segundos (Vercel Hobby tem limite de 10s, mas Pro tem 60s)
const FETCH_TIMEOUT = 25000

interface InstagramProfile {
  username: string
  full_name: string
  biography: string
  profile_pic_url: string
  followers: number
  following: number
  media_count: number
  is_verified: boolean
  is_business_account: boolean
  category?: string
}

interface InstagramPost {
  id: string
  shortcode: string
  caption: string
  media_url: string
  media_type: string
  like_count: number
  comment_count: number
  timestamp: string
  engagement_rate: number
}

// Helper para adicionar timeout em fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - API demorou muito para responder')
    }
    throw error
  }
}

export class InstagramAPI {
  private async fetchFromRapidAPI(endpoint: string, params?: Record<string, string>) {
    // Validar credenciais
    if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'undefined') {
      console.error('❌ RAPIDAPI_KEY não configurada!')
      throw new Error('RAPIDAPI_KEY não configurada. Configure nas variáveis de ambiente.')
    }

    if (!RAPIDAPI_HOST || RAPIDAPI_HOST === 'undefined') {
      console.error('❌ RAPIDAPI_HOST não configurada!')
      throw new Error('RAPIDAPI_HOST não configurada. Configure nas variáveis de ambiente.')
    }

    const url = new URL(`https://${RAPIDAPI_HOST}/${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    console.log('🔍 Chamando RapidAPI:', {
      endpoint,
      params,
      url: url.toString().replace(RAPIDAPI_KEY, 'HIDDEN'),
    })

    try {
      const response = await fetchWithTimeout(
        url.toString(),
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key': RAPIDAPI_KEY,
          },
        },
        FETCH_TIMEOUT
      )

      console.log('✅ RapidAPI Response Status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ RapidAPI Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })

        throw new Error(
          `RapidAPI Error: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      const data = await response.json()
      console.log('✅ RapidAPI Data received:', Object.keys(data))

      return data
    } catch (error: any) {
      console.error('❌ Erro na chamada RapidAPI:', error)
      throw error
    }
  }

  // Buscar informações do perfil
  async getProfile(username: string): Promise<InstagramProfile> {
    try {
      console.log('📱 Buscando perfil:', username)

      const data = await this.fetchFromRapidAPI('v1.2/user-info', { username_or_id_or_url: username })

      return {
        username: data.username || username,
        full_name: data.full_name || '',
        biography: data.biography || '',
        profile_pic_url: data.profile_pic_url || '',
        followers: data.follower_count || 0,
        following: data.following_count || 0,
        media_count: data.media_count || 0,
        is_verified: data.is_verified || false,
        is_business_account: data.is_business_account || false,
        category: data.category_name || undefined,
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      throw error
    }
  }

  // Buscar posts do usuário
  async getUserPosts(username: string, count: number = 50): Promise<InstagramPost[]> {
    try {
      console.log('📸 Buscando posts:', { username, count })

      const data = await this.fetchFromRapidAPI('v1.2/user-posts', {
        username_or_id_or_url: username,
        count: count.toString(),
      })

      if (!data.items || !Array.isArray(data.items)) {
        console.warn('⚠️ Nenhum post encontrado')
        return []
      }

      console.log(`✅ ${data.items.length} posts encontrados`)

      return data.items.map((item: any) => {
        const likeCount = item.like_count || 0
        const commentCount = item.comment_count || 0
        const followers = data.follower_count || 1000

        const engagementRate = followers > 0
          ? ((likeCount + commentCount) / followers) * 100
          : 0

        return {
          id: item.id || item.pk,
          shortcode: item.code || item.shortcode || '',
          caption: item.caption?.text || '',
          media_url: item.thumbnail_url || item.display_url || item.image_versions2?.candidates?.[0]?.url || '',
          media_type: item.media_type === 1 ? 'IMAGE' : item.media_type === 2 ? 'VIDEO' : 'CAROUSEL',
          like_count: likeCount,
          comment_count: commentCount,
          timestamp: new Date(item.taken_at * 1000).toISOString(),
          engagement_rate: parseFloat(engagementRate.toFixed(2)),
        }
      })
    } catch (error) {
      console.error('❌ Error fetching posts:', error)
      throw error
    }
  }

  // Buscar posts em alta (top posts por hashtag)
  async getTopPostsByHashtag(hashtag: string, count: number = 20): Promise<InstagramPost[]> {
    try {
      console.log('🔥 Buscando top posts:', { hashtag, count })

      const data = await this.fetchFromRapidAPI('v1.2/hashtag-posts', {
        hashtag_name: hashtag,
        count: count.toString(),
      })

      if (!data.items || !Array.isArray(data.items)) {
        return []
      }

      return data.items.map((item: any) => ({
        id: item.id || item.pk,
        shortcode: item.code || item.shortcode || '',
        caption: item.caption?.text || '',
        media_url: item.thumbnail_url || item.display_url || '',
        media_type: item.media_type === 1 ? 'IMAGE' : 'VIDEO',
        like_count: item.like_count || 0,
        comment_count: item.comment_count || 0,
        timestamp: new Date(item.taken_at * 1000).toISOString(),
        engagement_rate: 0,
      }))
    } catch (error) {
      console.error('❌ Error fetching hashtag posts:', error)
      throw error
    }
  }
}

export const instagramAPI = new InstagramAPI()
