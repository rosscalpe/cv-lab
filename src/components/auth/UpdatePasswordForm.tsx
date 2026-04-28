'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/lib/supabase/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function UpdatePasswordForm() {
  const [state, action, isPending] = useActionState(updatePassword, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {state.error}
        </div>
      )}

      <Input
        name="password"
        type="password"
        label="Nueva contraseña"
        placeholder="Mínimo 6 caracteres"
        required
        autoComplete="new-password"
        minLength={6}
      />

      <Input
        name="confirmPassword"
        type="password"
        label="Confirmar contraseña"
        placeholder="Repetí la contraseña"
        required
        autoComplete="new-password"
        minLength={6}
      />

      <Button type="submit" loading={isPending} className="w-full">
        Guardar nueva contraseña
      </Button>
    </form>
  )
}
