import { NextRequest, NextResponse } from 'next/server'
import { instagramAPI } from '@/lib/instagram-api'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hashtag = searchParams.get('hashtag')
    const count = parseInt(searchParams.get('count') || '20')

    if (!hashtag) {
      return NextResponse.json(
        { error: 'Hashtag is required' },
        { status: 400 }
      )
    }

    const posts = await instagramAPI.getTopPostsByHashtag(hashtag, count)

    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error('Top posts API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch top posts' },
      { status: 500 }
    )
  }
}
