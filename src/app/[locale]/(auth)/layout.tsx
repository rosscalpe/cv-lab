import { getTranslations } from 'next-intl/server'

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export default async function AuthLayout({ children, params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'export' })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/CVlab1.png" alt="CVLab" className="mx-auto mb-3 h-14 w-14 rounded-2xl" />
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#1e3458' }}>
          CVLab
        </span>
        <p className="mt-1 text-sm text-neutral-500">{t('title')}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
