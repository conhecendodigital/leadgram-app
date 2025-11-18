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

/**
 * Valida a assinatura do webhook do Mercado Pago usando HMAC SHA-256
 * Previne webhooks falsos e garante que a requisição veio do Mercado Pago
 *
 * @param xSignature - Header x-signature (formato: "ts=1234567890,v1=hash")
 * @param xRequestId - Header x-request-id
 * @param dataId - ID do pagamento/notificação
 * @param secretKey - Access token do Mercado Pago (usado como secret)
 * @returns true se a assinatura é válida, false caso contrário
 *
 * Referência: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secretKey: string
): boolean {
  try {
    // Validar se os parâmetros obrigatórios existem
    if (!xSignature || !xRequestId || !dataId || !secretKey) {
      console.error('Missing required parameters for webhook validation')
      return false
    }

    // Extrair timestamp e hash do header x-signature
    // Formato esperado: "ts=1234567890,v1=abc123..."
    const signatureParts = xSignature.split(',')

    if (signatureParts.length !== 2) {
      console.error('Invalid x-signature format')
      return false
    }

    const tsPart = signatureParts[0]
    const hashPart = signatureParts[1]

    // Validar formato ts=...
    if (!tsPart.startsWith('ts=')) {
      console.error('Missing ts in x-signature')
      return false
    }

    // Validar formato v1=...
    if (!hashPart.startsWith('v1=')) {
      console.error('Missing v1 in x-signature')
      return false
    }

    const ts = tsPart.split('=')[1]
    const receivedHash = hashPart.split('=')[1]

    // Criar manifest (string que será assinada)
    // Formato: id:{data.id};request-id:{x-request-id};ts:{timestamp};
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

    // Calcular HMAC SHA-256
    const crypto = require('crypto')
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(manifest)
      .digest('hex')

    // Comparar hashes (timing-safe)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedHash),
      Buffer.from(receivedHash)
    )

    if (!isValid) {
      console.error('Webhook signature mismatch', {
        received: receivedHash.substring(0, 10) + '...',
        calculated: calculatedHash.substring(0, 10) + '...',
      })
    }

    return isValid
  } catch (error) {
    console.error('Error validating webhook signature:', error)
    return false
  }
}
