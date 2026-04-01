import type { UserCVData } from '@/types/database'

export type { UserCVData }

export interface TemplateProps {
  data: UserCVData
  /** Etiquetas traducidas para los títulos de sección */
  labels?: {
    summary?: string
    experience?: string
    education?: string
    skills?: string
    languages?: string
    certifications?: string
    projects?: string
    present?: string
  }
  /** Color de acento elegido por el usuario */
  accentColor?: string
}

export const DEFAULT_LABELS = {
  summary: 'Resumen profesional',
  experience: 'Experiencia',
  education: 'Educación',
  skills: 'Habilidades',
  languages: 'Idiomas',
  certifications: 'Certificaciones',
  projects: 'Proyectos',
  present: 'Actualidad',
}

/** Formatea una fecha ISO parcial "2021-03" → "Mar 2021" */
export function fmtDate(iso: string | null | undefined, present: string): string {
  if (!iso) return ''
  const [y, m] = iso.split('-')
  if (!m) return y
  const month = new Date(`${y}-${m}-01`).toLocaleString('es', { month: 'short' })
  return `${month} ${y}`
}

/** Rango de fechas para experiencia */
export function dateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  isCurrent: boolean,
  present: string,
): string {
  const s = fmtDate(start, present)
  const e = isCurrent ? present : fmtDate(end, present)
  return [s, e].filter(Boolean).join(' – ')
}
