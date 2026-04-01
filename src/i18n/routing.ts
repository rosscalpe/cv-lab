import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  // El locale por defecto NO se incluye en la URL: /dashboard en vez de /es/dashboard
  localePrefix: 'as-needed',
})

export type Locale = typeof routing.locales[number]
