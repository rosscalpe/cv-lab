/**
 * Esta página no se renderiza directamente: el middleware de next-intl
 * reescribe la URL `/` hacia `[locale]/page.tsx` antes de que Next.js
 * resuelva el routing. Se mantiene como fallback de seguridad.
 */
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}
