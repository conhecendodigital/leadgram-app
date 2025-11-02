import { NextRequest, NextResponse } from 'next/server'
import { instagramAPI } from '@/lib/instagram-api'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30 // Vercel Pro: até 60s, Hobby: 10s

export async function GET(request: NextRequest) {
  console.log('🚀 API Route: /api/instagram/posts')

  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')
    const count = parseInt(searchParams.get('count') || '50')

    console.log('📝 Params:', { username, count })

    if (!username) {
      console.error('❌ Username não fornecido')
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Buscando posts:', username)
    const posts = await instagramAPI.getUserPosts(username, count)

    console.log(`✅ ${posts.length} posts encontrados`)
    return NextResponse.json({ posts })

  } catch (error: any) {
    console.error('❌ Posts API error:', {
      message: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch posts',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
