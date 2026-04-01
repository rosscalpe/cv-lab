'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { resetPassword } from '@/lib/supabase/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ResetPasswordForm() {
  const [state, action, isPending] = useActionState(resetPassword, null)
  const t = useTranslations('auth')

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {state.error}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label={t('email')}
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />

      <Button type="submit" loading={isPending} className="w-full">
        {t('resetPassword')}
      </Button>
    </form>
  )
}
