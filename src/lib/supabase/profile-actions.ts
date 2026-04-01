'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error?: string; success?: boolean } | null

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

// ─── Profile (datos personales + resumen) ────────────────────────────────────

export async function updateProfile(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const str = (key: string) => (formData.get(key) as string) || null

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: str('first_name'),
      last_name: str('last_name'),
      headline: str('headline'),
      phone: str('phone'),
      city: str('city'),
      country: str('country'),
      linkedin_url: str('linkedin_url'),
      portfolio_url: str('portfolio_url'),
      summary: str('summary'),
    })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

// ─── Foto de perfil ───────────────────────────────────────────────────────────

export async function uploadProfilePhoto(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const file = formData.get('photo') as File
  if (!file || file.size === 0) return { error: 'No se seleccionó archivo' }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error } = await supabase
    .from('profiles')
    .update({ photo_url: publicUrl })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

// ─── Experiencias ─────────────────────────────────────────────────────────────

export async function upsertExperience(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const id = formData.get('id') as string | null
  const payload = {
    user_id: user.id,
    company: formData.get('company') as string,
    role: formData.get('role') as string,
    start_date: (formData.get('start_date') as string) || null,
    end_date: (formData.get('end_date') as string) || null,
    is_current: formData.get('is_current') === 'on',
    description: (formData.get('description') as string) || null,
  }

  const { error } = id
    ? await supabase.from('experiences').update(payload).eq('id', id).eq('user_id', user.id)
    : await supabase.from('experiences').insert(payload)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteExperience(id: string, _: FormData): Promise<void> {
  const { supabase, user } = await getUser()
  if (!user) return
  await supabase.from('experiences').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/profile')
}

// ─── Educación ────────────────────────────────────────────────────────────────

export async function upsertEducation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const id = formData.get('id') as string | null
  const toInt = (key: string) => {
    const v = formData.get(key) as string
    return v ? parseInt(v, 10) : null
  }
  const payload = {
    user_id: user.id,
    institution: formData.get('institution') as string,
    degree: formData.get('degree') as string,
    start_year: toInt('start_year'),
    end_year: toInt('end_year'),
  }

  const { error } = id
    ? await supabase.from('educations').update(payload).eq('id', id).eq('user_id', user.id)
    : await supabase.from('educations').insert(payload)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteEducation(id: string, _: FormData): Promise<void> {
  const { supabase, user } = await getUser()
  if (!user) return
  await supabase.from('educations').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/profile')
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function upsertSkill(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const id = formData.get('id') as string | null
  const payload = {
    user_id: user.id,
    name: formData.get('name') as string,
    level: (formData.get('level') as string) || null,
  }

  const { error } = id
    ? await supabase.from('skills').update(payload).eq('id', id).eq('user_id', user.id)
    : await supabase.from('skills').insert(payload)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function bulkUpsertSkills(
  skills: Array<{ name: string; level?: string | null }>,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }
  if (!skills.length) return { error: 'No hay habilidades para guardar' }

  const rows = skills
    .filter((s) => s.name.trim())
    .map((s, i) => ({
      user_id: user.id,
      name: s.name.trim(),
      level: s.level || null,
      order_index: i,
    }))

  const { error } = await supabase.from('skills').insert(rows)
  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteSkill(id: string, _: FormData): Promise<void> {
  const { supabase, user } = await getUser()
  if (!user) return
  await supabase.from('skills').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/profile')
}

// ─── Idiomas ──────────────────────────────────────────────────────────────────

export async function upsertLanguage(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const id = formData.get('id') as string | null
  const payload = {
    user_id: user.id,
    language: formData.get('language') as string,
    level: (formData.get('level') as string) || null,
  }

  const { error } = id
    ? await supabase.from('languages').update(payload).eq('id', id).eq('user_id', user.id)
    : await supabase.from('languages').insert(payload)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteLanguage(id: string, _: FormData): Promise<void> {
  const { supabase, user } = await getUser()
  if (!user) return
  await supabase.from('languages').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/profile')
}

// ─── Certificaciones ──────────────────────────────────────────────────────────

export async function upsertCertification(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const id = formData.get('id') as string | null
  const payload = {
    user_id: user.id,
    name: formData.get('name') as string,
    issuer: (formData.get('issuer') as string) || null,
    year: formData.get('year') ? parseInt(formData.get('year') as string, 10) : null,
  }

  const { error } = id
    ? await supabase.from('certifications').update(payload).eq('id', id).eq('user_id', user.id)
    : await supabase.from('certifications').insert(payload)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteCertification(id: string, _: FormData): Promise<void> {
  const { supabase, user } = await getUser()
  if (!user) return
  await supabase.from('certifications').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/profile')
}

// ─── Proyectos ────────────────────────────────────────────────────────────────

export async function upsertProject(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'No autenticado' }

  const id = formData.get('id') as string | null
  const payload = {
    user_id: user.id,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    url: (formData.get('url') as string) || null,
  }

  const { error } = id
    ? await supabase.from('projects').update(payload).eq('id', id).eq('user_id', user.id)
    : await supabase.from('projects').insert(payload)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteProject(id: string, _: FormData): Promise<void> {
  const { supabase, user } = await getUser()
  if (!user) return
  await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/profile')
}
