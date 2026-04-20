import { notFound } from 'next/navigation'
import { verifyPrintToken } from '@/lib/print-token'
import { createServiceClient } from '@/lib/supabase/service'
import { getUserCVDataAsService } from '@/lib/supabase/queries'
import { TEMPLATE_REGISTRY } from '@/components/pdf/templates'
import type { UserCVData } from '@/types/database'

type Props = {
  params: Promise<{ token: string }>
}

export default async function PrintPage({ params }: Props) {
  const { token } = await params

  let payload
  try {
    payload = verifyPrintToken(token)
  } catch {
    notFound()
  }

  // El token ya está firmado con HMAC — no necesitamos verificar sesión de nuevo.
  // Usamos service role para buscar los datos del usuario por su ID.
  const supabase = createServiceClient()
  const cvData = await getUserCVDataAsService(supabase, payload.userId)

  // Aplicar overrides traducidos sobre los datos de la BD
  const finalData: UserCVData = payload.overrides
    ? {
        ...cvData,
        profile: cvData.profile
          ? {
              ...cvData.profile,
              ...(payload.overrides.summary !== undefined
                ? { summary: payload.overrides.summary }
                : {}),
              ...(payload.overrides.headline !== undefined
                ? { headline: payload.overrides.headline }
                : {}),
            }
          : null,
        experiences: payload.overrides.experiences
          ? cvData.experiences.map((exp) => {
              const t = payload.overrides!.experiences!.find((te) => te.id === exp.id)
              return t ? { ...exp, description: t.description ?? exp.description } : exp
            })
          : cvData.experiences,
        projects: payload.overrides.projects
          ? cvData.projects.map((proj) => {
              const t = payload.overrides!.projects!.find((tp) => tp.id === proj.id)
              return t ? { ...proj, description: t.description ?? proj.description } : proj
            })
          : cvData.projects,
      }
    : cvData

  const TemplateComponent = TEMPLATE_REGISTRY[payload.templateName]
  if (!TemplateComponent) notFound()

  return <TemplateComponent data={finalData} accentColor={payload.accentColor} />
}
