import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

/**
 * POST /api/webhooks/mercadopago
 *
 * MercadoPago envía notificaciones en dos formatos:
 * - IPN (Checkout Pro notification_url): query params ?topic=payment&id=PAYMENT_ID
 * - Webhooks (dashboard): body { action: 'payment.created', data: { id: '...' } }
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // ── Detectar el formato de la notificación ──────────────────────────────────
  let paymentId: string | null = null

  // Formato IPN: query params
  const topic = searchParams.get('topic')
  if (topic === 'payment') {
    paymentId = searchParams.get('id')
  }

  // Formato Webhook: body JSON
  if (!paymentId) {
    try {
      const body = await request.json()
      if (
        (body.action === 'payment.created' || body.action === 'payment.updated') &&
        body.data?.id
      ) {
        paymentId = String(body.data.id)
      }
    } catch {
      // Body vacío o no es JSON — ignorar
    }
  }

  if (!paymentId) {
    // Notificación de otro tipo (merchant_order, etc.) — responder 200 para evitar reintentos
    return NextResponse.json({ received: true })
  }

  const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
  const paymentClient = new Payment(mp)

  let payment
  try {
    payment = await paymentClient.get({ id: paymentId })
  } catch (err) {
    console.error('[webhook/mercadopago] error fetching payment:', err)
    return NextResponse.json({ error: 'Error fetching payment' }, { status: 500 })
  }

  if (payment.status !== 'approved') {
    return NextResponse.json({ received: true })
  }

  // external_reference tiene el formato "{userId}|{templateId}"
  const ref = payment.external_reference ?? ''
  const [userId, templateId] = ref.split('|')

  if (!userId || !templateId) {
    console.error('[webhook/mercadopago] invalid external_reference:', ref)
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from('user_template_access').upsert(
    {
      user_id: userId,
      template_id: templateId,
      payment_provider: 'mercadopago',
      payment_id: String(payment.id),
    },
    { onConflict: 'user_id,template_id' },
  )

  if (error) {
    console.error('[webhook/mercadopago] DB insert failed:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  console.log(`[webhook/mercadopago] access granted: user=${userId} template=${templateId}`)
  return NextResponse.json({ received: true })
}
