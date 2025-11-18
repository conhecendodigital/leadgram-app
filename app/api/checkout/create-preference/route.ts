import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { withRateLimit, getRequestIdentifier } from '@/lib/api-middleware'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting: 5 req/min por usuário (previne fraude)
  const identifier = getRequestIdentifier(request, user.id)

  return withRateLimit(request, identifier, 5, 60, async () => {
    try {
      const body = await request.json()
      const { plan } = body // 'pro' ou 'premium'

      if (!plan || !['pro', 'premium'].includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      // Buscar credenciais do ADMIN
      const { data: adminCreds, error: credsError } = await (supabase
        .from('admin_mercadopago') as any)
        .select('access_token')
        .eq('is_active', true)
        .single()

      if (credsError || !adminCreds) {
        return NextResponse.json(
          { error: 'Mercado Pago não configurado. Entre em contato com o suporte.' },
          { status: 500 }
        )
      }

      const client = new MercadoPagoConfig({
        accessToken: adminCreds.access_token
      })

      const preference = new Preference(client)

      const planPrices: Record<string, number> = {
        pro: 49,
        premium: 99
      }

      const planNames: Record<string, string> = {
        pro: 'Pro',
        premium: 'Premium'
      }

      const result = await preference.create({
        body: {
          items: [
            {
              id: `leadgram-${plan}`,
              title: `Plano ${planNames[plan]} - Leadgram`,
              quantity: 1,
              unit_price: planPrices[plan],
              currency_id: 'BRL',
            }
          ],
          payer: {
            email: user.email!,
          },
          external_reference: `${user.id}-${plan}`,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=success`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=failure`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=pending`,
          },
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
        }
      })

      return NextResponse.json({ init_point: result.init_point })
    } catch (error: any) {
      console.error('Error creating preference:', error)
      return NextResponse.json(
        { error: 'Erro ao criar pagamento. Tente novamente.' },
        { status: 500 }
      )
    }
  })
}
