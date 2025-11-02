import { NextRequest, NextResponse } from 'next/server'
import { instagramAPI } from '@/lib/instagram-api'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30 // Vercel Pro: até 60s, Hobby: 10s

export async function GET(request: NextRequest) {
  console.log('🚀 API Route: /api/instagram/profile')

  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    console.log('📝 Params:', { username })

    if (!username) {
      console.error('❌ Username não fornecido')
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Buscando perfil:', username)
    const profile = await instagramAPI.getProfile(username)

    console.log('✅ Perfil encontrado:', profile.username)
    return NextResponse.json(profile)

  } catch (error: any) {
    console.error('❌ Profile API error:', {
      message: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch profile',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
