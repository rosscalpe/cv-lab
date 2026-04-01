import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para uso en el browser (Client Components).
 * Singleton para evitar múltiples instancias por render.
 * Nota: cuando conectes el proyecto en Supabase, generá los tipos con
 * `supabase gen types typescript` y pasalos como genérico aquí.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
