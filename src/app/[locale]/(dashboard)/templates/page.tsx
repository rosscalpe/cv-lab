import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTemplatesWithAccess } from '@/lib/supabase/template-queries'
import { getUserCVData } from '@/lib/supabase/queries'
import { TemplateGallery } from '@/components/templates/TemplateGallery'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ templates }, cvData] = await Promise.all([
    getTemplatesWithAccess(user.id),
    getUserCVData(user.id),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1e3458' }}>Plantillas</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Elegí el diseño de tu CV. Hacé clic en una plantilla para previsualizar con tus datos reales.
        </p>
      </div>

      <TemplateGallery templates={templates} cvData={cvData} />
    </div>
  )
}
