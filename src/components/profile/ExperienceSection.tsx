'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import {
  upsertExperience,
  deleteExperience,
} from '@/lib/supabase/profile-actions'
import type { Experience } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'

function ExperienceForm({
  item,
  onClose,
}: {
  item?: Experience
  onClose: () => void
}) {
  const [state, action, isPending] = useActionState(upsertExperience, null)
  const [isCurrent, setIsCurrent] = useState(item?.is_current ?? false)
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

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="company"
          label={t('company')}
          defaultValue={item?.company}
          required
          placeholder="Google"
        />
        <Input
          name="role"
          label={t('role')}
          defaultValue={item?.role}
          required
          placeholder="Software Engineer"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="start_date"
          type="date"
          label={t('startDate')}
          defaultValue={item?.start_date ?? ''}
        />
        <Input
          name="end_date"
          type="date"
          label={t('endDate')}
          defaultValue={item?.end_date ?? ''}
          disabled={isCurrent}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="is_current"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
          className="rounded border-neutral-300"
        />
        {t('currentJob')}
      </label>

      <Textarea
        name="description"
        label={t('description')}
        defaultValue={item?.description ?? ''}
        rows={3}
        placeholder="Describí tus responsabilidades y logros..."
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isPending}>
          {tc('save')}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {tc('cancel')}
        </Button>
      </div>
    </form>
  )
}

function ExperienceItem({
  item,
  onEdit,
}: {
  item: Experience
  onEdit: () => void
}) {
  const tc = useTranslations('common')
  const cv = useTranslations('cv')

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-neutral-900">{item.company}</p>
        <p className="text-sm text-neutral-600">{item.role}</p>
        <p className="mt-0.5 text-xs text-neutral-400">
          {item.start_date?.slice(0, 7)}{' '}
          —{' '}
          {item.is_current ? cv('present') : item.end_date?.slice(0, 7)}
        </p>
        {item.description && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{item.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          {tc('edit')}
        </Button>
        <form action={deleteExperience.bind(null, item.id)}>
          <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700">
            {tc('delete')}
          </Button>
        </form>
      </div>
    </div>
  )
}

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  return (
    <SectionCard
      title={t('experience')}
      headerAction={
        !showAdd && !editingId ? (
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
            + {tc('add')}
          </Button>
        ) : undefined
      }
    >
      <div className="divide-y divide-neutral-100">
        {experiences.map((exp) =>
          editingId === exp.id ? (
            <div key={exp.id} className="py-3">
              <ExperienceForm item={exp} onClose={() => setEditingId(null)} />
            </div>
          ) : (
            <ExperienceItem
              key={exp.id}
              item={exp}
              onEdit={() => setEditingId(exp.id)}
            />
          ),
        )}

        {experiences.length === 0 && !showAdd && (
          <p className="py-2 text-sm text-neutral-400">
            Todavía no agregaste experiencias.
          </p>
        )}
      </div>

      {showAdd && (
        <div className="mt-3">
          <ExperienceForm onClose={() => setShowAdd(false)} />
        </div>
      )}
    </SectionCard>
  )
}
