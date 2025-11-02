import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Payment, MercadoPagoConfig } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('Mercado Pago Webhook:', body)

    // Mercado Pago sends notifications with different types
    // We're interested in payment notifications
    if (body.type === 'payment') {
      const paymentId = body.data.id

      // Get payment details from Mercado Pago
      const paymentInfo = await payment.get({ id: paymentId })

      console.log('Payment Info:', paymentInfo)

      // Extract external reference (userId:planId)
      const externalReference = paymentInfo.external_reference
      if (!externalReference) {
        console.error('No external reference found')
        return NextResponse.json({ success: false }, { status: 400 })
      }

      const [userId, planId] = externalReference.split(':')

      // Update payment status in database
      const supabase = await createServerClient()

      // Update or insert payment record
      const { error: paymentError } = await (supabase
        .from('payments') as any)
        .update({
          status: paymentInfo.status,
          payment_id: paymentInfo.id?.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('plan_type', planId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (paymentError) {
        console.error('Error updating payment:', paymentError)
      }

      // If payment is approved, update user subscription
      if (paymentInfo.status === 'approved') {
        const now = new Date()
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)

        const { error: subscriptionError } = await (supabase
          .from('user_subscriptions') as any)
          .upsert(
            {
              user_id: userId,
              plan_type: planId,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: nextMonth.toISOString(),
              updated_at: now.toISOString(),
            },
            {
              onConflict: 'user_id',
            }
          )

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
        }

        // Create notification for the user
        await (supabase.from('notifications') as any).insert({
          user_id: userId,
          type: 'system_update',
          title: 'Pagamento Aprovado',
          message: `Seu plano ${planId} foi ativado com sucesso!`,
          read: false,
          created_at: now.toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Mercado Pago also sends GET requests to verify the webhook endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Webhook endpoint active' })
}
