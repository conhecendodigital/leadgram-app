import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Perfis populares sugeridos (pode ser expandido ou vir de um banco de dados)
const POPULAR_PROFILES = [
  { username: 'instagram', name: 'Instagram', category: 'Social Media' },
  { username: 'cristiano', name: 'Cristiano Ronaldo', category: 'Sports' },
  { username: 'leomessi', name: 'Lionel Messi', category: 'Sports' },
  { username: 'kyliejenner', name: 'Kylie Jenner', category: 'Celebrity' },
  { username: 'selenagomez', name: 'Selena Gomez', category: 'Music' },
  { username: 'therock', name: 'Dwayne Johnson', category: 'Entertainment' },
  { username: 'arianagrande', name: 'Ariana Grande', category: 'Music' },
  { username: 'kimkardashian', name: 'Kim Kardashian', category: 'Celebrity' },
  { username: 'beyonce', name: 'Beyoncé', category: 'Music' },
  { username: 'nike', name: 'Nike', category: 'Brand' },
  { username: 'adidas', name: 'Adidas', category: 'Brand' },
  { username: 'nasa', name: 'NASA', category: 'Science' },
  { username: 'natgeo', name: 'National Geographic', category: 'Media' },
  { username: 'neymarjr', name: 'Neymar Jr', category: 'Sports' },
  { username: 'khloekardashian', name: 'Khloé Kardashian', category: 'Celebrity' },
  { username: 'justinbieber', name: 'Justin Bieber', category: 'Music' },
  { username: 'kendalljenner', name: 'Kendall Jenner', category: 'Fashion' },
  { username: 'taylorswift', name: 'Taylor Swift', category: 'Music' },
  { username: 'jlo', name: 'Jennifer Lopez', category: 'Entertainment' },
  { username: 'virat.kohli', name: 'Virat Kohli', category: 'Sports' },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 1) {
      // Retornar perfis populares se não houver busca
      return NextResponse.json({
        suggestions: POPULAR_PROFILES.slice(0, 10)
      })
    }

    // Filtrar perfis que correspondem à busca
    const cleanQuery = query.toLowerCase().replace('@', '')

    const suggestions = POPULAR_PROFILES
      .filter(profile =>
        profile.username.toLowerCase().includes(cleanQuery) ||
        profile.name.toLowerCase().includes(cleanQuery) ||
        profile.category.toLowerCase().includes(cleanQuery)
      )
      .slice(0, 10) // Limitar a 10 sugestões

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search profiles' },
      { status: 500 }
    )
  }
}
