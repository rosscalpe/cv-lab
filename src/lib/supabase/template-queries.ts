import { createClient } from '@/lib/supabase/server'
import type { Template } from '@/types/database'

export type TemplateWithAccess = Template & { hasAccess: boolean }

export interface TemplatesData {
  templates: TemplateWithAccess[]
  hasTranslationPackEN: boolean
  hasTranslationPackPT: boolean
  translationPackENId?: string
  translationPackPTId?: string
}

export async function getTemplatesWithAccess(userId: string): Promise<TemplatesData> {
  const supabase = await createClient()

  const [templatesRes, accessRes] = await Promise.all([
    supabase.from('templates').select('*').eq('is_active', true).order('is_premium'),
    supabase
      .from('user_template_access')
      .select('template_id')
      .eq('user_id', userId),
  ])

  const ownedIds = new Set((accessRes.data ?? []).map((a: { template_id: string }) => a.template_id))

  const all = (templatesRes.data ?? []).map((t: Template) => ({
    ...t,
    hasAccess: !t.is_premium || ownedIds.has(t.id),
  }))

  const translationPackEN = all.find((t) => t.name === 'Translation Pack EN')
  const translationPackPT = all.find((t) => t.name === 'Translation Pack PT')

  return {
    templates: all.filter((t) => t.category !== 'addon'),
    hasTranslationPackEN: translationPackEN?.hasAccess ?? false,
    hasTranslationPackPT: translationPackPT?.hasAccess ?? false,
    translationPackENId: translationPackEN?.id,
    translationPackPTId: translationPackPT?.id,
  }
}
