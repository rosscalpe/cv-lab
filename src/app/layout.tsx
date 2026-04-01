import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CVLab — Creá tu CV profesional',
  description:
    'Creá, personalizá y exportá tu currículum vitae en segundos. Plantillas profesionales, múltiples idiomas, descarga en PDF.',
}

/**
 * Layout raíz: sin lang fijo porque cada [locale] lo define en su propio layout.
 * No incluir <NextIntlClientProvider> aquí — va en src/app/[locale]/layout.tsx.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        {children}
      </body>
    </html>
  )
}
