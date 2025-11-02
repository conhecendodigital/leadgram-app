import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rapidapiKey = process.env.RAPIDAPI_KEY
  const rapidapiHost = process.env.RAPIDAPI_HOST

  return NextResponse.json({
    hasRapidApiKey: !!rapidapiKey,
    hasRapidApiHost: !!rapidapiHost,
    rapidApiKeyLength: rapidapiKey?.length || 0,
    rapidApiHost: rapidapiHost || 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    // NÃO exponha os valores reais em produção!
  })
}
