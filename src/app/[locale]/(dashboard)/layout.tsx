import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar
        labels={{
          profile: t('profile'),
          templates: t('templates'),
          export: t('export'),
          logout: t('logout'),
        }}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  )
}
