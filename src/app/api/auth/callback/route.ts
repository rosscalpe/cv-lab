import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * GET /api/auth/callback
 * Punto de entrada tras OAuth (Google, LinkedIn) y confirmación de email.
 * Supabase redirige aquí con un `code` que se intercambia por una sesión.
 */
function buildSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/profile'
  const redirectTo = `${origin}${next}`

  // ── Flujo OAuth / Magic Link (code) ────────────────────────────────────────
  const code = searchParams.get('code')
  if (code) {
    const response = NextResponse.redirect(redirectTo)
    const supabase = buildSupabaseClient(request, response)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
  }

  // ── Flujo Email OTP / Recovery (token_hash) ────────────────────────────────
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'recovery' | 'email' | 'signup' | null
  if (token_hash && type) {
    const response = NextResponse.redirect(redirectTo)
    const supabase = buildSupabaseClient(request, response)
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) return response
  }

  // Algo salió mal → volver al login con error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
