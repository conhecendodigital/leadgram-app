import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateWebhookSignature } from '@/lib/mercadopago'
import { logError } from '@/lib/utils/api-error-handler'

export async function POST(request: NextRequest) {
  try {
    // BUG #12 FIX: Validar Content-Type antes de processar
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type. Expected application/json' },
        { status: 400 }
      )
    }

    // Extrair headers de assinatura do Mercado Pago
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }
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

      // Validar assinatura do webhook ANTES de processar pagamento
      const isValidSignature = validateWebhookSignature(
        xSignature,
        xRequestId,
        body.data.id,
        adminCreds.access_token
      )

      if (!isValidSignature) {
        console.error('⚠️ INVALID WEBHOOK SIGNATURE - Possible fraud attempt')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }

      console.log('✅ Webhook signature validated successfully')

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

      // BUG #1 FIX: Validar formato do external_reference
      if (!payment.external_reference.includes('-')) {
        console.error('Invalid external_reference format:', payment.external_reference)
        return NextResponse.json({ received: true })
      }

      const parts = payment.external_reference.split('-')
      if (parts.length !== 2) {
        console.error('Invalid external_reference parts:', parts)
        return NextResponse.json({ received: true })
      }

      const [userId, planType] = parts

      if (!userId || !planType) {
        console.error('Missing userId or planType')
        return NextResponse.json({ received: true })
      }

      if (payment.status === 'approved') {
        const { data: existingSub } = await (supabaseAdmin
          .from('user_subscriptions') as any)
          .select('*')
          .eq('user_id', userId)
          .single()

        // BUG #2 FIX: Usar mesma instância de Date para consistência
        const now = new Date()
        const periodEnd = new Date(now)
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        if (existingSub) {
          await (supabaseAdmin
            .from('user_subscriptions') as any)
            .update({
              plan_type: planType,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              updated_at: now.toISOString(),
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
              current_period_start: now.toISOString(),
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
    // Registrar erro crítico de pagamento no sistema de notificações
    await logError(error, 'Webhook Mercado Pago - Erro ao processar pagamento', 'critical')
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
