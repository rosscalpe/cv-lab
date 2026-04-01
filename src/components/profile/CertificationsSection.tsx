'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { upsertCertification, deleteCertification } from '@/lib/supabase/profile-actions'
import type { Certification } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'

function CertificationForm({
  item,
  onClose,
}: {
  item?: Certification
  onClose: () => void
}) {
  const [state, action, isPending] = useActionState(upsertCertification, null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  useEffect(() => {
    if (state?.success) onClose()
  }, [state?.success, onClose])

  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Input
        name="name"
        label={t('certName')}
        defaultValue={item?.name}
        required
        placeholder="AWS Solutions Architect"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="issuer"
          label={t('issuer')}
          defaultValue={item?.issuer ?? ''}
          placeholder="Amazon Web Services"
        />
        <Input
          name="year"
          type="number"
          label={t('year')}
          defaultValue={item?.year ?? ''}
          min={1990}
          max={2099}
          placeholder="2023"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isPending}>{tc('save')}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>{tc('cancel')}</Button>
      </div>
    </form>
  )
}

export function CertificationsSection({
  certifications,
}: {
  certifications: Certification[]
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  return (
    <SectionCard
      title={t('certifications')}
      headerAction={
        !showAdd && !editingId ? (
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
            + {tc('add')}
          </Button>
        ) : undefined
      }
    >
      <div className="divide-y divide-neutral-100">
        {certifications.map((cert) =>
          editingId === cert.id ? (
            <div key={cert.id} className="py-3">
              <CertificationForm item={cert} onClose={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={cert.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-neutral-900">{cert.name}</p>
                {cert.issuer && (
                  <p className="text-sm text-neutral-600">{cert.issuer}</p>
                )}
                {cert.year && (
                  <p className="text-xs text-neutral-400">{cert.year}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(cert.id)}>
                  {tc('edit')}
                </Button>
                <form action={deleteCertification.bind(null, cert.id)}>
                  <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700">
                    {tc('delete')}
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        {certifications.length === 0 && !showAdd && (
          <p className="py-2 text-sm text-neutral-400">Todavía no agregaste certificaciones.</p>
        )}
      </div>

      {showAdd && (
        <div className="mt-3">
          <CertificationForm onClose={() => setShowAdd(false)} />
        </div>
      )}
    </SectionCard>
  )
}
