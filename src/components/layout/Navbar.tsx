'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/supabase/actions'

interface NavbarProps {
  labels: {
    profile: string
    templates: string
    export: string
    logout: string
  }
}

export function Navbar({ labels }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/profile', label: labels.profile },
    { href: '/templates', label: labels.templates },
    { href: '/export', label: labels.export },
  ]

  const isActive = (href: string) => pathname.includes(href)

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/profile" className="flex items-center gap-0 shrink-0">
          <Image src="/CVlab1.png" alt="CVLab" width={0} height={0} sizes="100vw" className="h-20 w-auto" />
          <span className="text-base font-bold tracking-tight" style={{ color: '#1e3458' }}>CVLab</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'rounded-md px-3 py-1.5 transition-colors font-medium',
                isActive(link.href)
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop logout */}
        <form action={logout} className="hidden md:block">
          <button
            type="submit"
            className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors px-2 py-1 rounded-md hover:bg-neutral-50"
          >
            {labels.logout}
          </button>
        </form>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menú"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-3 pb-3 pt-2 space-y-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={[
                'flex rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-1 border-t border-neutral-100 mt-1">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full rounded-lg px-3 py-2.5 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
              >
                {labels.logout}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
