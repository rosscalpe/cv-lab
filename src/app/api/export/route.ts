import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserCVData } from '@/lib/supabase/queries'
import { generatePDF } from '@/lib/pdf'
import { createPrintToken } from '@/lib/print-token'
import { translateCVContent } from '@/lib/translate'

// Puppeteer requiere el runtime de Node.js (no Edge)
export const runtime = 'nodejs'

// Tiempo máximo de ejecución: 60 segundos (Puppeteer puede tardar)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  // ── Autenticación ───────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // ── Parámetros del request ──────────────────────────────────────────────────
  let templateId: string
  let locale: string
  let accentColor: string | undefined

  try {
    const body = await request.json()
    templateId = body.templateId
    locale = body.locale ?? 'es'
    accentColor = body.accentColor ?? undefined
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!templateId) {
    return NextResponse.json({ error: 'templateId requerido' }, { status: 400 })
  }

  // ── Verificar existencia de la plantilla ────────────────────────────────────
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
  }

  // ── Verificar acceso a plantillas premium ───────────────────────────────────
  if (template.is_premium) {
    const { data: access } = await supabase
      .from('user_template_access')
      .select('template_id')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .single()

    // También verificar suscripción activa
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single()

    if (!access && !subscription) {
      return NextResponse.json(
        { error: 'No tenés acceso a esta plantilla premium' },
        { status: 403 },
      )
    }
  }

  // ── Obtener datos del CV ────────────────────────────────────────────────────
  const cvData = await getUserCVData(user.id)

  // ── Traducir contenido si el locale no es español ───────────────────────────
  let overrides
  if (locale !== 'es') {
    try {
      overrides = await translateCVContent(
        {
          summary: cvData.profile?.summary,
          headline: cvData.profile?.headline,
          experiences: cvData.experiences.map((e) => ({ id: e.id, description: e.description })),
          projects: cvData.projects.map((p) => ({ id: p.id, description: p.description })),
        },
        locale,
      )
    } catch (err) {
      console.error('[export] translation failed, using original content:', err)
    }
  }

  // ── Generar token de impresión y URL ────────────────────────────────────────
  const token = createPrintToken(user.id, template.name, locale, overrides, accentColor)
  // Puppeteer corre en el servidor, siempre accede por localhost directamente
  const appUrl = process.env.PUPPETEER_BASE_URL ?? 'http://localhost:3000'
  const printUrl = `${appUrl}/print/${token}`

  // ── Generar PDF ─────────────────────────────────────────────────────────────
  const cookieHeader = request.headers.get('cookie') ?? ''

  try {
    const pdfBuffer = await generatePDF(printUrl, cookieHeader)

    const namePart = [cvData.profile?.first_name, cvData.profile?.last_name]
      .filter(Boolean)
      .join('_')
    const filename = `CV_${namePart || 'CVLab'}_${locale}.pdf`

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (err) {
    console.error('[PDF generation error]', err)
    return NextResponse.json(
      { error: 'Error generando el PDF. Intentá de nuevo.' },
      { status: 500 },
    )
  }
}
