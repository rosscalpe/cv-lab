import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateCVContent, type CVTranslatableContent } from '@/lib/translate'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * POST /api/translate
 * Body: { content: CVTranslatableContent, targetLocale: 'es' | 'en' | 'pt' }
 *
 * Traduce los campos de texto del CV con Claude Haiku.
 * La traducción es efímera — no se persiste en la BD.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let content: CVTranslatableContent
  let targetLocale: string

  try {
    const body = await request.json()
    content = body.content
    targetLocale = body.targetLocale
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!content || !targetLocale) {
    return NextResponse.json({ error: 'content y targetLocale son requeridos' }, { status: 400 })
  }

  if (targetLocale === 'es') {
    // Sin traducción necesaria, devolver el contenido original
    return NextResponse.json({ translated: content })
  }

  try {
    const translated = await translateCVContent(content, targetLocale)
    return NextResponse.json({ translated })
  } catch (err) {
    console.error('[/api/translate]', err)
    return NextResponse.json({ error: 'Error en la traducción' }, { status: 500 })
  }
}
