import Link from 'next/link'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export default function UpdatePasswordPage() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">
        Nueva contraseña
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Ingresá tu nueva contraseña para continuar.
      </p>

      <UpdatePasswordForm />

      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          ← Volver al login
        </Link>
      </p>
    </div>
  )
}
