'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { upsertEducation, deleteEducation } from '@/lib/supabase/profile-actions'
import type { Education } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'

function EducationForm({ item, onClose }: { item?: Education; onClose: () => void }) {
  const [state, action, isPending] = useActionState(upsertEducation, null)
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
        name="institution"
        label={t('institution')}
        defaultValue={item?.institution}
        required
        placeholder="Universidad de Buenos Aires"
      />
      <Input
        name="degree"
        label={t('degree')}
        defaultValue={item?.degree}
        required
        placeholder="Ingeniería en Informática"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="start_year"
          type="number"
          label={t('startYear')}
          defaultValue={item?.start_year ?? ''}
          min={1950}
          max={2099}
          placeholder="2018"
        />
        <Input
          name="end_year"
          type="number"
          label={t('endYear')}
          defaultValue={item?.end_year ?? ''}
          min={1950}
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

export function EducationSection({ educations }: { educations: Education[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  return (
    <SectionCard
      title={t('education')}
      headerAction={
        !showAdd && !editingId ? (
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
            + {tc('add')}
          </Button>
        ) : undefined
      }
    >
      <div className="divide-y divide-neutral-100">
        {educations.map((edu) =>
          editingId === edu.id ? (
            <div key={edu.id} className="py-3">
              <EducationForm item={edu} onClose={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={edu.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-neutral-900">{edu.institution}</p>
                <p className="text-sm text-neutral-600">{edu.degree}</p>
                {(edu.start_year || edu.end_year) && (
                  <p className="text-xs text-neutral-400">
                    {edu.start_year} — {edu.end_year ?? ''}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(edu.id)}>
                  {tc('edit')}
                </Button>
                <form action={deleteEducation.bind(null, edu.id)}>
                  <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700">
                    {tc('delete')}
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}
        {educations.length === 0 && !showAdd && (
          <p className="py-2 text-sm text-neutral-400">Todavía no agregaste educación.</p>
        )}
      </div>

      {showAdd && (
        <div className="mt-3">
          <EducationForm onClose={() => setShowAdd(false)} />
        </div>
      )}
    </SectionCard>
  )
}
