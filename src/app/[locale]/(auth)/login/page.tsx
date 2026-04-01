import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    redirect?: string
    message?: 'check_email' | 'reset_sent'
    error?: string
  }>
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { redirect, message, error } = await searchParams
  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t('login')}</h1>

      {/* Mensajes de feedback */}
      {message === 'check_email' && (
        <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          {t('checkEmailMessage')}
        </div>
      )}
      {message === 'reset_sent' && (
        <div className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 border border-blue-200">
          {t('resetSentMessage')}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {t('authError')}
        </div>
      )}

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
      <LoginForm redirectTo={redirect} />

      {/* Enlace a forgot password */}
      <div className="mt-3 text-right">
        <Link
          href="/reset-password"
          className="text-xs text-neutral-500 hover:text-blue-600 hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      {/* Enlace a registro */}
      <p className="mt-6 text-center text-sm text-neutral-600">
        {t('noAccount')}{' '}
        <Link href="/register" className="font-medium text-blue-600 hover:underline">
          {t('register')}
        </Link>
      </p>
    </div>
  )
}
