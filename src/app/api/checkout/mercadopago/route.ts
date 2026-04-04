import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * POST /api/checkout/mercadopago
 * Body: { templateId: string }
 *
 * Crea una preferencia de MercadoPago para pago único de plantilla premium.
 * Devuelve { url } (init_point) para redirigir al usuario.
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
  let returnTemplateId: string | undefined
  try {
    const body = await request.json()
    templateId = body.templateId
    returnTemplateId = body.returnTemplateId
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

  const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
  const preference = new Preference(mp)

  const appUrl = new URL(request.url).origin

  const result = await preference.create({
    body: {
      items: [
        {
          id: templateId,
          title: `CVLab — ${template.name}`,
          description: 'Plantilla premium para CV (acceso permanente)',
          quantity: 1,
          unit_price: Number(template.price_ars),
          currency_id: 'ARS',
        },
      ],
      external_reference: `${user.id}|${templateId}`,
      back_urls: {
        success: `${appUrl}/export?payment=success${returnTemplateId ? `&returnTemplateId=${returnTemplateId}` : `&templateId=${templateId}`}`,
        failure: `${appUrl}/export?payment=cancelled${returnTemplateId ? `&returnTemplateId=${returnTemplateId}` : `&templateId=${templateId}`}`,
        pending: `${appUrl}/export?payment=pending${returnTemplateId ? `&returnTemplateId=${returnTemplateId}` : `&templateId=${templateId}`}`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    },
  })

  return NextResponse.json({ url: result.init_point })
}
