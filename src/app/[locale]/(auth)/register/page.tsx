import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t('register')}</h1>

      {/* OAuth */}
      <OAuthButtons />

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-neutral-400">{t('orWithEmail')}</span>
        </div>
      </div>

      {/* Formulario */}
      <RegisterForm />

      {/* Enlace a login */}
      <p className="mt-6 text-center text-sm text-neutral-600">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          {t('login')}
        </Link>
      </p>
    </div>
  )
}
