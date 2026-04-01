import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * POST /api/checkout/stripe
 * Body: { templateId: string }
 *
 * Crea una Stripe Checkout Session de pago único para una plantilla premium.
 * Devuelve { url } para redirigir al usuario a Stripe.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let templateId: string
  try {
    const body = await request.json()
    templateId = body.templateId
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!templateId) {
    return NextResponse.json({ error: 'templateId requerido' }, { status: 400 })
  }

  // Verificar que la plantilla existe y es premium
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_premium', true)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
  }

  // Verificar que no la tenga ya comprada
  const { data: existingAccess } = await supabase
    .from('user_template_access')
    .select('template_id')
    .eq('user_id', user.id)
    .eq('template_id', templateId)
    .single()

  if (existingAccess) {
    return NextResponse.json({ error: 'Ya tenés acceso a esta plantilla' }, { status: 409 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(Number(template.price_usd) * 100), // centavos
          product_data: {
            name: `CVLab — ${template.name}`,
            description: `Plantilla premium para CV (acceso permanente)`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      templateId,
    },
    success_url: `${appUrl}/export?templateId=${templateId}&payment=success`,
    cancel_url: `${appUrl}/export?templateId=${templateId}&payment=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
