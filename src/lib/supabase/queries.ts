import { createClient } from '@/lib/supabase/server'
import type {
  Profile,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Project,
} from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCVData(supabase: any, userId: string) {
  const [profile, experiences, educations, skills, languages, certifications, projects] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('experiences').select('*').eq('user_id', userId).order('start_date', { ascending: false, nullsFirst: false }),
      supabase.from('educations').select('*').eq('user_id', userId).order('start_year', { ascending: false, nullsFirst: false }),
      supabase.from('skills').select('*').eq('user_id', userId).order('order_index'),
      supabase.from('languages').select('*').eq('user_id', userId),
      supabase.from('certifications').select('*').eq('user_id', userId),
      supabase.from('projects').select('*').eq('user_id', userId),
    ])

  return {
    profile: profile.data as Profile | null,
    experiences: (experiences.data ?? []) as Experience[],
    educations: (educations.data ?? []) as Education[],
    skills: (skills.data ?? []) as Skill[],
    languages: (languages.data ?? []) as Language[],
    certifications: (certifications.data ?? []) as Certification[],
    projects: (projects.data ?? []) as Project[],
  }
}

export async function getUserCVData(userId: string) {
  const supabase = await createClient()
  return fetchCVData(supabase, userId)
}

/** For server-only contexts where RLS shouldn't apply (e.g. print page). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserCVDataAsService(supabase: any, userId: string) {
  return fetchCVData(supabase, userId)
}
