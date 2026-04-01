import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para uso en el servidor (Server Components, Route Handlers,
 * Server Actions). Lee/escribe cookies para mantener la sesión.
 * Nota: cuando conectes el proyecto en Supabase, generá los tipos con
 * `supabase gen types typescript` y pasalos como genérico aquí.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll es llamado desde un Server Component; las cookies se
            // manejarán en el middleware.
          }
        },
      },
    },
  )
}
