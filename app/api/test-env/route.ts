import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL || '❌ NÃO CONFIGURADO',
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL || '❌ NÃO CONFIGURADO',
    'NEXT_PUBLIC_FACEBOOK_APP_ID': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
    'FACEBOOK_APP_SECRET': process.env.FACEBOOK_APP_SECRET ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
    'NEXT_PUBLIC_INSTAGRAM_APP_ID': process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
    'INSTAGRAM_APP_SECRET': process.env.INSTAGRAM_APP_SECRET ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
    'RAPIDAPI_KEY': process.env.RAPIDAPI_KEY ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
    'RAPIDAPI_HOST': process.env.RAPIDAPI_HOST || '❌ NÃO CONFIGURADO',
  })
}