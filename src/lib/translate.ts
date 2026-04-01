import Anthropic from '@anthropic-ai/sdk'

export interface CVTranslatableContent {
  summary?: string | null
  headline?: string | null
  experiences?: Array<{ id: string; description?: string | null }>
  projects?: Array<{ id: string; description?: string | null }>
}

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  pt: 'Brazilian Portuguese',
  es: 'Spanish',
}

/**
 * Traduce los campos de texto del CV usando Claude Haiku.
 * Los campos vacíos/null se ignoran. Si la API falla, retorna el contenido original.
 * Los nombres propios, empresas, URLs y fechas no se traducen (instrucción al modelo).
 */
export async function translateCVContent(
  content: CVTranslatableContent,
  targetLocale: string,
): Promise<CVTranslatableContent> {
  // Construir solo los campos que tienen contenido para traducir
  const payload: Record<string, unknown> = {}

  if (content.summary) payload.summary = content.summary
  if (content.headline) payload.headline = content.headline

  const expsWithDesc = (content.experiences ?? []).filter((e) => e.description)
  if (expsWithDesc.length > 0) {
    payload.experiences = expsWithDesc.map((e) => ({ id: e.id, description: e.description }))
  }

  const projsWithDesc = (content.projects ?? []).filter((p) => p.description)
  if (projsWithDesc.length > 0) {
    payload.projects = projsWithDesc.map((p) => ({ id: p.id, description: p.description }))
  }

  if (Object.keys(payload).length === 0) return content

  const targetLanguage = LOCALE_NAMES[targetLocale] ?? targetLocale

  const client = new Anthropic()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: `You are a professional CV/resume translator. Translate the provided JSON content to ${targetLanguage}.

Rules:
- Maintain a professional, polished tone appropriate for resumes
- Keep proper nouns, company names, job titles, URLs, email addresses, phone numbers, and technical terms unchanged
- Preserve all "id" field values exactly as they are (do not translate them)
- Return ONLY a valid JSON object with the exact same structure as the input
- Do not add explanations, comments, or markdown code blocks`,
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  let translated: CVTranslatableContent
  try {
    // Claude sometimes wraps in ```json ... ``` even when told not to
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    translated = JSON.parse(clean)
  } catch {
    // Si falla el parseo, devolver el contenido original
    console.error('[translate] JSON parse failed, using original content')
    return content
  }

  // Merge: partir de original y aplicar los campos traducidos
  return {
    summary: translated.summary ?? content.summary,
    headline: translated.headline ?? content.headline,
    experiences: content.experiences?.map((exp) => {
      const t = (translated.experiences ?? []).find((te) => te.id === exp.id)
      return t ? { ...exp, description: t.description } : exp
    }),
    projects: content.projects?.map((proj) => {
      const t = (translated.projects ?? []).find((tp) => tp.id === proj.id)
      return t ? { ...proj, description: t.description } : proj
    }),
  }
}
