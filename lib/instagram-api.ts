// Service para integrar com RapidAPI Instagram Scraper

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'instagram-scraper-api2.p.rapidapi.com'

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

export class InstagramAPI {
  private async fetchFromRapidAPI(endpoint: string, params?: Record<string, string>) {
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY não configurada. Configure no arquivo .env.local')
    }

    const url = new URL(`https://${RAPIDAPI_HOST}/${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('RapidAPI Error:', response.status, errorText)
      throw new Error(`Erro ao buscar dados do Instagram. Verifique suas credenciais RapidAPI.`)
    }

    return response.json()
  }

  // Buscar informações do perfil
  async getProfile(username: string): Promise<InstagramProfile> {
    try {
      const data = await this.fetchFromRapidAPI('user_info.php', { username })

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
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  // Buscar posts do usuário
  async getUserPosts(username: string, count: number = 50): Promise<InstagramPost[]> {
    try {
      const data = await this.fetchFromRapidAPI('user_posts.php', {
        username,
        count: count.toString(),
      })

      if (!data.items || !Array.isArray(data.items)) {
        return []
      }

      return data.items.map((item: any) => {
        const likeCount = item.like_count || 0
        const commentCount = item.comment_count || 0
        const followers = data.follower_count || 1000 // Fallback

        // Calcular taxa de engajamento
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
      console.error('Error fetching posts:', error)
      throw error
    }
  }

  // Buscar posts em alta (top posts por hashtag)
  async getTopPostsByHashtag(hashtag: string, count: number = 20): Promise<InstagramPost[]> {
    try {
      const data = await this.fetchFromRapidAPI('hashtag_posts.php', {
        hashtag,
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
        engagement_rate: 0, // Calcular depois se necessário
      }))
    } catch (error) {
      console.error('Error fetching hashtag posts:', error)
      throw error
    }
  }

  // Buscar stories do usuário (se disponível)
  async getUserStories(username: string): Promise<any[]> {
    try {
      const data = await this.fetchFromRapidAPI('user_stories.php', { username })
      return data.items || []
    } catch (error) {
      console.error('Error fetching stories:', error)
      return []
    }
  }

  // Buscar seguidores de um post específico
  async getPostLikers(shortcode: string, count: number = 50): Promise<any[]> {
    try {
      const data = await this.fetchFromRapidAPI('get_post_likers.php', {
        shortcode,
        count: count.toString(),
      })
      return data.users || []
    } catch (error) {
      console.error('Error fetching post likers:', error)
      return []
    }
  }

  // Buscar perfis similares
  async getSimilarProfiles(username: string): Promise<any[]> {
    try {
      const data = await this.fetchFromRapidAPI('similar_accounts.php', { username })
      return data.users || []
    } catch (error) {
      console.error('Error fetching similar profiles:', error)
      return []
    }
  }
}

export const instagramAPI = new InstagramAPI()
