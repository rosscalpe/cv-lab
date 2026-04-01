import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">
        {t('resetPassword')}
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Ingresá tu email y te enviamos un link para restablecer tu contraseña.
      </p>

      <ResetPasswordForm />

      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          ← {t('login')}
        </Link>
      </p>
    </div>
  )
}
