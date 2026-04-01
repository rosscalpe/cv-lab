// ─────────────────────────────────────────────────────────────────────────────
// ResumeFlow — Database Types
// Mirror exacto del schema de Supabase (generado manualmente, sincronizar con
// supabase/migrations/ cuando se hagan cambios en la BD).
// ─────────────────────────────────────────────────────────────────────────────

export type SkillLevel = 'basic' | 'intermediate' | 'advanced'
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type TemplateCategory = 'modern' | 'classic' | 'creative' | 'minimalist'
export type PaymentProvider = 'stripe' | 'mercadopago'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type ExportLocale = 'es' | 'en' | 'pt'

// ─── profiles ────────────────────────────────────────────────────────────────

export interface Profile {
  user_id: string
  first_name: string | null
  last_name: string | null
  headline: string | null
  email: string | null
  phone: string | null
  city: string | null
  country: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  photo_url: string | null
  /** Max 400 chars */
  summary: string | null
  created_at: string
  updated_at: string
}

// ─── experiences ─────────────────────────────────────────────────────────────

export interface Experience {
  id: string
  user_id: string
  company: string
  role: string
  start_date: string | null   // ISO date string
  end_date: string | null     // null when is_current = true
  is_current: boolean
  description: string | null
  order_index: number
}

// ─── educations ──────────────────────────────────────────────────────────────

export interface Education {
  id: string
  user_id: string
  institution: string
  degree: string
  start_year: number | null
  end_year: number | null
  order_index: number
}

// ─── skills ──────────────────────────────────────────────────────────────────

export interface Skill {
  id: string
  user_id: string
  name: string
  level: SkillLevel | null
  order_index: number
}

// ─── languages ───────────────────────────────────────────────────────────────

export interface Language {
  id: string
  user_id: string
  language: string
  level: LanguageLevel | null
}

// ─── certifications ──────────────────────────────────────────────────────────

export interface Certification {
  id: string
  user_id: string
  name: string
  issuer: string | null
  year: number | null
}

// ─── projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  url: string | null
}

// ─── templates ───────────────────────────────────────────────────────────────

export interface Template {
  id: string
  name: string
  thumbnail_url: string | null
  category: TemplateCategory
  is_premium: boolean
  price_usd: number
  price_ars: number
  is_active: boolean
}

// ─── user_template_access ────────────────────────────────────────────────────

export interface UserTemplateAccess {
  user_id: string
  template_id: string
  purchased_at: string
  payment_provider: PaymentProvider
  payment_id: string
}

// ─── subscriptions (Phase 2) ─────────────────────────────────────────────────

export interface Subscription {
  id: string
  user_id: string
  status: SubscriptionStatus
  payment_provider: PaymentProvider | null
  provider_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

// ─── Composite type: full CV data for a user ─────────────────────────────────

export interface UserCVData {
  profile: Profile | null
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  languages: Language[]
  certifications: Certification[]
  projects: Project[]
}

// ─── Supabase DB type map (for createClient<Database>()) ─────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'user_id' | 'created_at' | 'updated_at'>>
      }
      experiences: {
        Row: Experience
        Insert: Omit<Experience, 'id'>
        Update: Partial<Omit<Experience, 'id' | 'user_id'>>
      }
      educations: {
        Row: Education
        Insert: Omit<Education, 'id'>
        Update: Partial<Omit<Education, 'id' | 'user_id'>>
      }
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id'>
        Update: Partial<Omit<Skill, 'id' | 'user_id'>>
      }
      languages: {
        Row: Language
        Insert: Omit<Language, 'id'>
        Update: Partial<Omit<Language, 'id' | 'user_id'>>
      }
      certifications: {
        Row: Certification
        Insert: Omit<Certification, 'id'>
        Update: Partial<Omit<Certification, 'id' | 'user_id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id'>
        Update: Partial<Omit<Project, 'id' | 'user_id'>>
      }
      templates: {
        Row: Template
        Insert: Omit<Template, 'id'>
        Update: Partial<Omit<Template, 'id'>>
      }
      user_template_access: {
        Row: UserTemplateAccess
        Insert: UserTemplateAccess
        Update: never
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
