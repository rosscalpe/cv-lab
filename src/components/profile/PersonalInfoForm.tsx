'use client'

import { useActionState, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { updateProfile, uploadProfilePhoto } from '@/lib/supabase/profile-actions'
import type { Profile } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'

function PhotoUpload({ photoUrl }: { photoUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null)
  const [pendingFile, setPendingFile] = useState(false)
  const [photoState, photoAction, photoPending] = useActionState(uploadProfilePhoto, null)

  useEffect(() => {
    if (photoState?.success) setPendingFile(false)
  }, [photoState?.success])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(true)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <form action={photoAction} className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-100 border border-neutral-200">
        {preview ? (
          <Image src={preview} alt="Foto de perfil" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-8 w-8 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <input
          type="file"
          name="photo"
          id="photo-input"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <label
          htmlFor="photo-input"
          className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
        >
          Cambiar foto
        </label>
        {pendingFile && (
          <div>
            <Button type="submit" size="sm" loading={photoPending}>
              Guardar foto
            </Button>
          </div>
        )}
        {photoState?.error && (
          <p className="text-xs text-red-600">{photoState.error}</p>
        )}
        {photoState?.success && !pendingFile && (
          <p className="text-xs text-green-600">Foto guardada</p>
        )}
        <p className="text-xs text-neutral-400">PNG, JPG o WebP · máx. 2 MB</p>
      </div>
    </form>
  )
}

interface Props {
  profile: Profile | null
}

export function PersonalInfoForm({ profile }: Props) {
  const [state, action, isPending] = useActionState(updateProfile, null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  return (
    <SectionCard title={t('personalInfo')}>
      <div className="space-y-6">
        <PhotoUpload photoUrl={profile?.photo_url} />

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
              {tc('success')}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="first_name"
              label={t('firstName')}
              defaultValue={profile?.first_name ?? ''}
              placeholder="Juan"
            />
            <Input
              name="last_name"
              label={t('lastName')}
              defaultValue={profile?.last_name ?? ''}
              placeholder="Pérez"
            />
          </div>

          <Input
            name="headline"
            label={t('headline')}
            defaultValue={profile?.headline ?? ''}
            placeholder="Desarrollador Full Stack"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="phone"
              label={t('phone')}
              type="tel"
              defaultValue={profile?.phone ?? ''}
              placeholder="+54 11 1234-5678"
            />
            <Input
              name="city"
              label={t('city')}
              defaultValue={profile?.city ?? ''}
              placeholder="Buenos Aires"
            />
          </div>

          <Input
            name="country"
            label={t('country')}
            defaultValue={profile?.country ?? ''}
            placeholder="Argentina"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="linkedin_url"
              label={t('linkedin')}
              type="url"
              defaultValue={profile?.linkedin_url ?? ''}
              placeholder="https://linkedin.com/in/..."
            />
            <Input
              name="portfolio_url"
              label={t('portfolio')}
              type="url"
              defaultValue={profile?.portfolio_url ?? ''}
              placeholder="https://github.com/..."
            />
          </div>

          <Textarea
            name="summary"
            label={t('summary')}
            defaultValue={profile?.summary ?? ''}
            rows={5}
            maxLength={800}
            showCount
            hint={t('summaryHint')}
            placeholder="Describí tu perfil profesional en pocas palabras..."
          />

          <Button type="submit" loading={isPending}>
            {tc('save')}
          </Button>
        </form>
      </div>
    </SectionCard>
  )
}
