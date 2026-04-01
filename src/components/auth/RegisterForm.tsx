'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { register } from '@/lib/supabase/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function RegisterForm() {
  const [state, action, isPending] = useActionState(register, null)
  const t = useTranslations('auth')

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="firstName"
          type="text"
          label={t('firstName')}
          placeholder="Juan"
          required
          autoComplete="given-name"
        />
        <Input
          name="lastName"
          type="text"
          label={t('lastName')}
          placeholder="Pérez"
          required
          autoComplete="family-name"
        />
      </div>

      <Input
        name="email"
        type="email"
        label={t('email')}
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />

      <Input
        name="password"
        type="password"
        label={t('password')}
        placeholder="••••••••"
        required
        autoComplete="new-password"
        minLength={8}
        hint={t('passwordHint')}
      />

      <Button type="submit" loading={isPending} className="w-full">
        {t('register')}
      </Button>
    </form>
  )
}
