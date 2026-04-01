import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCVData } from '@/lib/supabase/queries'
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm'
import { ExperienceSection } from '@/components/profile/ExperienceSection'
import { EducationSection } from '@/components/profile/EducationSection'
import { SkillsSection } from '@/components/profile/SkillsSection'
import { LanguagesSection } from '@/components/profile/LanguagesSection'
import { CertificationsSection } from '@/components/profile/CertificationsSection'
import { ProjectsSection } from '@/components/profile/ProjectsSection'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const cvData = await getUserCVData(user.id)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1e3458' }}>Mi Perfil</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Completá tu información para generar tu CV.
        </p>
      </div>

      <PersonalInfoForm profile={cvData.profile} />
      <ExperienceSection experiences={cvData.experiences} />
      <EducationSection educations={cvData.educations} />
      <SkillsSection skills={cvData.skills} />
      <LanguagesSection languages={cvData.languages} />
      <CertificationsSection certifications={cvData.certifications} />
      <ProjectsSection projects={cvData.projects} />
    </div>
  )
}
