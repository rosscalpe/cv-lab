interface SectionCardProps {
  title: string
  children: React.ReactNode
  headerAction?: React.ReactNode
}

export function SectionCard({ title, children, headerAction }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
        <h2 className="font-semibold text-neutral-900">{title}</h2>
        {headerAction}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}
