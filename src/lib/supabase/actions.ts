'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

type ActionState = { error: string } | null

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  const redirectTo = (formData.get('redirect') as string | null) || '/profile'
  redirect(redirectTo)
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
      },
    },
  })

  if (error) return { error: error.message }

  // Si la confirmación de email está deshabilitada, ya hay sesión activa
  if (data.session) redirect('/profile')

  // Email de confirmación enviado
  redirect('/login?message=check_email')
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Reset password (enviar email) ───────────────────────────────────────────

export async function resetPassword(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    {
      redirectTo: `${origin}/api/auth/callback?next=/reset-password/update`,
    },
  )

  if (error) return { error: error.message }

  redirect('/login?message=reset_sent')
}

// ─── Update password (después del callback de reset) ─────────────────────────

export async function updatePassword(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  redirect('/profile')
}

// ─── OAuth: Google ────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error || !data.url) return
  redirect(data.url)
}
