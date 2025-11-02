import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Mercado Pago Webhook:', body)

    if (body.type === 'payment') {
      const paymentId = body.data.id

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: adminCreds } = await (supabaseAdmin
        .from('admin_mercadopago') as any)
        .select('access_token')
        .eq('is_active', true)
        .single()

      if (!adminCreds) {
        console.error('No active Mercado Pago credentials found')
        return NextResponse.json({ error: 'No credentials' }, { status: 500 })
      }

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminCreds.access_token}`
          }
        }
      )

      const payment = await paymentResponse.json()

      if (!payment.external_reference) {
        console.error('No external_reference found in payment')
        return NextResponse.json({ received: true })
      }

      const [userId, planType] = payment.external_reference.split('-')

      if (payment.status === 'approved') {
        const { data: existingSub } = await (supabaseAdmin
          .from('user_subscriptions') as any)
          .select('*')
          .eq('user_id', userId)
          .single()

        const now = new Date()
        const periodEnd = new Date(now.setMonth(now.getMonth() + 1))

        if (existingSub) {
          await (supabaseAdmin
            .from('user_subscriptions') as any)
            .update({
              plan_type: planType,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        } else {
          await (supabaseAdmin
            .from('user_subscriptions') as any)
            .insert({
              user_id: userId,
              plan_type: planType,
              status: 'active',
              mercadopago_subscription_id: payment.id.toString(),
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
        }

        await (supabaseAdmin
          .from('payments') as any)
          .insert({
            user_id: userId,
            mercadopago_payment_id: payment.id.toString(),
            amount: payment.transaction_amount,
            status: payment.status,
            payment_method: payment.payment_type_id,
          })
      }

      if (payment.status === 'rejected' || payment.status === 'cancelled') {
        await (supabaseAdmin
          .from('user_subscriptions') as any)
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
