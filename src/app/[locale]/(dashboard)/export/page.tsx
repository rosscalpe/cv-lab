import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTemplatesWithAccess } from '@/lib/supabase/template-queries'
import { getUserCVData } from '@/lib/supabase/queries'
import { ExportForm } from '@/components/export/ExportForm'

type Props = {
  searchParams: Promise<{ templateId?: string }>
}

export default async function ExportPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { templateId } = await searchParams

  const [{ templates, hasTranslationPackEN, hasTranslationPackPT, translationPackENId, translationPackPTId }, cvData] = await Promise.all([
    getTemplatesWithAccess(user.id),
    getUserCVData(user.id),
  ])

  const hasProfile = !!(cvData.profile?.first_name || cvData.profile?.last_name)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1e3458' }}>Exportar CV</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Elegí la plantilla y el idioma, luego descargá tu CV en PDF.
        </p>
      </div>

      {!hasProfile && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-medium text-amber-900">Tu perfil está incompleto</p>
          <p className="mt-1 text-xs text-amber-700">
            Completá al menos tu nombre y apellido en{' '}
            <a href="/profile" className="underline hover:text-amber-900">
              Mi Perfil
            </a>{' '}
            antes de exportar.
          </p>
        </div>
      )}

      <ExportForm
        templates={templates}
        cvData={cvData}
        defaultTemplateId={templateId}
        hasTranslationPackEN={hasTranslationPackEN}
        hasTranslationPackPT={hasTranslationPackPT}
        translationPackENId={translationPackENId}
        translationPackPTId={translationPackPTId}
      />
    </div>
  )
}
