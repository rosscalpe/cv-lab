import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

/**
 * POST /api/webhooks/stripe
 * Recibe eventos de Stripe y actualiza user_template_access en la BD.
 * Requiere que en el Stripe Dashboard esté configurado el endpoint
 * y la variable STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook/stripe] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const templateId = session.metadata?.templateId

    if (!userId || !templateId) {
      console.error('[webhook/stripe] missing metadata', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // Usar service role para bypass de RLS — el webhook no tiene sesión de usuario
    const supabase = createServiceClient()

    const { error } = await supabase.from('user_template_access').upsert(
      {
        user_id: userId,
        template_id: templateId,
        payment_provider: 'stripe',
        payment_id: session.payment_intent as string ?? session.id,
      },
      { onConflict: 'user_id,template_id' },
    )

    if (error) {
      console.error('[webhook/stripe] DB insert failed:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    console.log(`[webhook/stripe] access granted: user=${userId} template=${templateId}`)
  }

  // Devolver 200 a Stripe para cualquier evento (evitar reintentos innecesarios)
  return NextResponse.json({ received: true })
}
