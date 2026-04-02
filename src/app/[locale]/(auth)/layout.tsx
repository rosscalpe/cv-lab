type Props = { children: React.ReactNode }

export default async function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/CVlab1.png" alt="CVLab" className="mx-auto mb-3 h-20 w-20 rounded-2xl" />
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#1e3458' }}>
          CVLab
        </span>
        <p className="mt-1 text-sm text-neutral-500">Tu CV al instante</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
