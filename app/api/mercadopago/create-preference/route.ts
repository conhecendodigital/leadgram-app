import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createPaymentPreference, PlanId } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { planId } = body

    if (!planId || !['PRO', 'PREMIUM'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Create payment preference
    const preferenceResponse = await createPaymentPreference(
      planId as PlanId,
      user.id,
      user.email || ''
    )

    // Store payment intent in database
    await (supabase.from('payments') as any).insert({
      user_id: user.id,
      plan_type: planId,
      amount: planId === 'PRO' ? 49.0 : 99.0,
      currency: 'BRL',
      status: 'pending',
      payment_id: preferenceResponse.id,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      preference_id: preferenceResponse.id,
      init_point: preferenceResponse.init_point,
      sandbox_init_point: preferenceResponse.sandbox_init_point,
    })
  } catch (error) {
    console.error('Error creating payment preference:', error)
    return NextResponse.json(
      { error: 'Failed to create payment preference' },
      { status: 500 }
    )
  }
}
