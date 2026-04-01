import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Ruta raíz del locale (`/` en español, `/en`, `/pt`).
 * Redirige según estado de sesión:
 * - Autenticado → /profile
 * - No autenticado → /login
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  redirect(user ? '/profile' : '/login')
}
