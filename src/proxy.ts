import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

/** Rutas que requieren sesión activa */
const PROTECTED_PATHS = ['/profile', '/templates', '/export']

/** Rutas solo para usuarios NO autenticados */
const AUTH_PATHS = ['/login', '/register', '/reset-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorar archivos estáticos y rutas de API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Crear respuesta base con headers de next-intl
  const response = intlMiddleware(request)

  // Crear cliente Supabase que lee/escribe cookies en la request/response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Normalizar path eliminando el prefijo de locale para la comparación
  const pathnameWithoutLocale = routing.locales.reduce(
    (acc, locale) => acc.replace(new RegExp(`^/${locale}`), '') || '/',
    pathname,
  )

  const isProtected = PROTECTED_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p),
  )
  const isAuthRoute = AUTH_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p),
  )

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Capturar todas las rutas excepto los archivos estáticos de Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
