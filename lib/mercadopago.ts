import { MercadoPagoConfig, Preference } from 'mercadopago'

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
})

export const preference = new Preference(client)

// Plan pricing configuration
export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: 0,
    currency: 'BRL',
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 49.0,
    currency: 'BRL',
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 99.0,
    currency: 'BRL',
  },
}

export type PlanId = keyof typeof PLANS

export async function createPaymentPreference(
  planId: PlanId,
  userId: string,
  userEmail: string
) {
  const plan = PLANS[planId]

  if (!plan || plan.price === 0) {
    throw new Error('Invalid plan or free plan selected')
  }

  try {
    const preferenceData = {
      items: [
        {
          id: plan.id,
          title: `Leadgram - Plano ${plan.name}`,
          description: `Assinatura mensal do plano ${plan.name}`,
          quantity: 1,
          unit_price: plan.price,
          currency_id: plan.currency,
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?payment=pending`,
      },
      auto_return: 'approved' as const,
      external_reference: `${userId}:${planId}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
      statement_descriptor: 'LEADGRAM',
    }

    const response = await preference.create({ body: preferenceData })
    return response
  } catch (error) {
    console.error('Error creating payment preference:', error)
    throw error
  }
}

export function validateWebhookSignature(requestBody: string, signature: string): boolean {
  // In production, implement proper signature validation
  // For now, we'll return true for development
  // See: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
  return true
}
