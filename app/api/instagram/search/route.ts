import { NextRequest, NextResponse } from 'next/server'
import { instagramAPI } from '@/lib/instagram-api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Cache simples em memória (para evitar buscar o mesmo perfil várias vezes)
const profileCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hora

// Perfis populares sugeridos expandidos (100+ perfis)
const POPULAR_PROFILES = [
  // Social Media & Tech
  { username: 'instagram', name: 'Instagram', category: 'Social Media' },
  { username: 'facebook', name: 'Facebook', category: 'Social Media' },
  { username: 'tiktok', name: 'TikTok', category: 'Social Media' },
  { username: 'youtube', name: 'YouTube', category: 'Social Media' },
  { username: 'twitter', name: 'Twitter', category: 'Social Media' },
  { username: 'linkedin', name: 'LinkedIn', category: 'Social Media' },
  { username: 'google', name: 'Google', category: 'Tech' },
  { username: 'apple', name: 'Apple', category: 'Tech' },
  { username: 'microsoft', name: 'Microsoft', category: 'Tech' },
  { username: 'meta', name: 'Meta', category: 'Tech' },

  // Sports Stars
  { username: 'cristiano', name: 'Cristiano Ronaldo', category: 'Sports' },
  { username: 'leomessi', name: 'Lionel Messi', category: 'Sports' },
  { username: 'neymarjr', name: 'Neymar Jr', category: 'Sports' },
  { username: 'virat.kohli', name: 'Virat Kohli', category: 'Sports' },
  { username: 'kingjames', name: 'LeBron James', category: 'Sports' },
  { username: 'stephencurry30', name: 'Stephen Curry', category: 'Sports' },
  { username: 'realmadrid', name: 'Real Madrid', category: 'Sports' },
  { username: 'fcbarcelona', name: 'FC Barcelona', category: 'Sports' },
  { username: 'nba', name: 'NBA', category: 'Sports' },
  { username: 'ufc', name: 'UFC', category: 'Sports' },

  // Music
  { username: 'beyonce', name: 'Beyoncé', category: 'Music' },
  { username: 'arianagrande', name: 'Ariana Grande', category: 'Music' },
  { username: 'selenagomez', name: 'Selena Gomez', category: 'Music' },
  { username: 'taylorswift', name: 'Taylor Swift', category: 'Music' },
  { username: 'justinbieber', name: 'Justin Bieber', category: 'Music' },
  { username: 'badgalriri', name: 'Rihanna', category: 'Music' },
  { username: 'theweeknd', name: 'The Weeknd', category: 'Music' },
  { username: 'billieeilish', name: 'Billie Eilish', category: 'Music' },
  { username: 'drake', name: 'Drake', category: 'Music' },
  { username: 'edsheeran', name: 'Ed Sheeran', category: 'Music' },
  { username: 'katyperry', name: 'Katy Perry', category: 'Music' },
  { username: 'ladygaga', name: 'Lady Gaga', category: 'Music' },
  { username: 'brunomars', name: 'Bruno Mars', category: 'Music' },
  { username: 'shawnmendes', name: 'Shawn Mendes', category: 'Music' },

  // Celebrities & Entertainment
  { username: 'kyliejenner', name: 'Kylie Jenner', category: 'Celebrity' },
  { username: 'kimkardashian', name: 'Kim Kardashian', category: 'Celebrity' },
  { username: 'khloekardashian', name: 'Khloé Kardashian', category: 'Celebrity' },
  { username: 'kendalljenner', name: 'Kendall Jenner', category: 'Fashion' },
  { username: 'therock', name: 'Dwayne Johnson', category: 'Entertainment' },
  { username: 'jlo', name: 'Jennifer Lopez', category: 'Entertainment' },
  { username: 'zendaya', name: 'Zendaya', category: 'Entertainment' },
  { username: 'tomholland2013', name: 'Tom Holland', category: 'Entertainment' },
  { username: 'priyankachopra', name: 'Priyanka Chopra', category: 'Entertainment' },
  { username: 'willsmith', name: 'Will Smith', category: 'Entertainment' },
  { username: 'robertdowneyjr', name: 'Robert Downey Jr', category: 'Entertainment' },
  { username: 'chrishemsworth', name: 'Chris Hemsworth', category: 'Entertainment' },

  // Brands - Fashion
  { username: 'nike', name: 'Nike', category: 'Brand' },
  { username: 'adidas', name: 'Adidas', category: 'Brand' },
  { username: 'puma', name: 'Puma', category: 'Brand' },
  { username: 'gucci', name: 'Gucci', category: 'Fashion' },
  { username: 'chanel', name: 'Chanel', category: 'Fashion' },
  { username: 'louisvuitton', name: 'Louis Vuitton', category: 'Fashion' },
  { username: 'dior', name: 'Dior', category: 'Fashion' },
  { username: 'versace', name: 'Versace', category: 'Fashion' },
  { username: 'balenciaga', name: 'Balenciaga', category: 'Fashion' },
  { username: 'prada', name: 'Prada', category: 'Fashion' },
  { username: 'zara', name: 'Zara', category: 'Fashion' },
  { username: 'hm', name: 'H&M', category: 'Fashion' },

  // Media & News
  { username: 'natgeo', name: 'National Geographic', category: 'Media' },
  { username: 'nasa', name: 'NASA', category: 'Science' },
  { username: 'bbcnews', name: 'BBC News', category: 'News' },
  { username: 'cnn', name: 'CNN', category: 'News' },
  { username: 'nytimes', name: 'The New York Times', category: 'News' },
  { username: 'time', name: 'TIME', category: 'Media' },
  { username: 'forbes', name: 'Forbes', category: 'Business' },
  { username: 'wired', name: 'WIRED', category: 'Tech' },
  { username: 'techcrunch', name: 'TechCrunch', category: 'Tech' },

  // Food & Lifestyle
  { username: 'tasty', name: 'Tasty', category: 'Food' },
  { username: 'foodnetwork', name: 'Food Network', category: 'Food' },
  { username: 'gordonramsay', name: 'Gordon Ramsay', category: 'Food' },
  { username: 'jamieoliver', name: 'Jamie Oliver', category: 'Food' },

  // Gaming & Esports
  { username: 'playstation', name: 'PlayStation', category: 'Gaming' },
  { username: 'xbox', name: 'Xbox', category: 'Gaming' },
  { username: 'nintendo', name: 'Nintendo', category: 'Gaming' },
  { username: 'fortnite', name: 'Fortnite', category: 'Gaming' },
  { username: 'callofduty', name: 'Call of Duty', category: 'Gaming' },

  // Travel & Photography
  { username: 'beautifuldestinations', name: 'Beautiful Destinations', category: 'Travel' },
  { username: 'earthpix', name: 'EarthPix', category: 'Photography' },
  { username: 'natgeotravel', name: 'Nat Geo Travel', category: 'Travel' },

  // Influencers Brasileiros
  { username: 'whinderssonnunes', name: 'Whindersson Nunes', category: 'Entertainment' },
  { username: 'anitta', name: 'Anitta', category: 'Music' },
  { username: 'luisasonza', name: 'Luísa Sonza', category: 'Music' },
  { username: 'tirullipa', name: 'Tirullipa', category: 'Entertainment' },
  { username: 'canalcanalha', name: 'Canal Canalha', category: 'Entertainment' },
  { username: 'felipe_neto', name: 'Felipe Neto', category: 'Entertainment' },
  { username: 'lucashucks', name: 'Lucas Hucks', category: 'Entertainment' },
  { username: 'alok', name: 'Alok', category: 'Music' },
  { username: 'kefera', name: 'Kéfera', category: 'Entertainment' },
  { username: 'tatawerneck', name: 'Tatá Werneck', category: 'Entertainment' },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 1) {
      // Retornar perfis populares com fotos quando não há busca
      const topProfiles = POPULAR_PROFILES.slice(0, 12)

      return NextResponse.json({
        suggestions: topProfiles.map(p => ({
          ...p,
          profile_pic_url: null // Frontend mostrará avatar com inicial
        }))
      })
    }

    // Limpar query
    const cleanQuery = query.toLowerCase().replace('@', '').trim()

    if (cleanQuery.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // 1. Buscar na lista local primeiro
    const localMatches = POPULAR_PROFILES
      .filter(profile =>
        profile.username.toLowerCase().includes(cleanQuery) ||
        profile.name.toLowerCase().includes(cleanQuery) ||
        profile.category.toLowerCase().includes(cleanQuery)
      )
      .slice(0, 10)

    // 2. Se encontrou matches locais, retornar
    if (localMatches.length > 0) {
      return NextResponse.json({
        suggestions: localMatches.map(p => ({
          ...p,
          profile_pic_url: null // Sem foto para economizar API requests
        }))
      })
    }

    // 3. Se não encontrou nada local E o usuário digitou um username específico (min 3 chars)
    // Tentar buscar na API real (apenas se parecer um username válido)
    if (cleanQuery.length >= 3 && /^[a-z0-9._]+$/.test(cleanQuery)) {
      console.log('🔍 Buscando perfil na RapidAPI:', cleanQuery)

      // Verificar cache primeiro
      const cached = profileCache.get(cleanQuery)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Perfil encontrado no cache:', cleanQuery)
        return NextResponse.json({
          suggestions: [cached.data]
        })
      }

      try {
        // Buscar perfil real na API
        const profile = await instagramAPI.getProfile(cleanQuery)

        const suggestion = {
          username: profile.username,
          name: profile.full_name || profile.username,
          category: profile.category || (profile.is_verified ? 'Verified' : 'User'),
          profile_pic_url: profile.profile_pic_url,
          followers: profile.followers,
          is_verified: profile.is_verified
        }

        // Salvar no cache
        profileCache.set(cleanQuery, {
          data: suggestion,
          timestamp: Date.now()
        })

        console.log('✅ Perfil encontrado na RapidAPI:', cleanQuery)

        return NextResponse.json({
          suggestions: [suggestion]
        })
      } catch (apiError: any) {
        console.log('❌ Perfil não encontrado na RapidAPI:', cleanQuery, apiError.message)

        // Se não encontrou na API, retornar vazio
        return NextResponse.json({
          suggestions: [],
          message: 'Perfil não encontrado. Tente outro username.'
        })
      }
    }

    // Se não encontrou nada, retornar vazio
    return NextResponse.json({
      suggestions: []
    })

  } catch (error: any) {
    console.error('❌ Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search profiles' },
      { status: 500 }
    )
  }
}
