'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { upsertLanguage, deleteLanguage } from '@/lib/supabase/profile-actions'
import type { Language } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((v) => ({
  value: v,
  label: v,
}))

function LanguageForm({ item, onClose }: { item?: Language; onClose: () => void }) {
  const [state, action, isPending] = useActionState(upsertLanguage, null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  useEffect(() => {
    if (state?.success) onClose()
  }, [state?.success, onClose])

  return (
    <form
      action={action}
      className="flex items-end gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3"
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Input
        name="language"
        label={t('language')}
        defaultValue={item?.language}
        required
        placeholder="Inglés"
        className="flex-1"
      />
      <Select
        name="level"
        label={t('languageLevel')}
        defaultValue={item?.level ?? ''}
        placeholder="Nivel"
        options={CEFR_LEVELS}
        className="w-28"
      />
      <div className="flex gap-1 pb-0.5">
        <Button type="submit" size="sm" loading={isPending}>{tc('save')}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>{tc('cancel')}</Button>
      </div>
    </form>
  )
}

export function LanguagesSection({ languages }: { languages: Language[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  return (
    <SectionCard
      title={t('languages')}
      headerAction={
        !showAdd && !editingId ? (
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
            + {tc('add')}
          </Button>
        ) : undefined
      }
    >
      <div className="divide-y divide-neutral-100">
        {languages.map((lang) =>
          editingId === lang.id ? (
            <div key={lang.id} className="py-3">
              <LanguageForm item={lang} onClose={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={lang.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="font-medium text-neutral-900">{lang.language}</span>
                {lang.level && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    {lang.level}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(lang.id)}>
                  {tc('edit')}
                </Button>
                <form action={deleteLanguage.bind(null, lang.id)}>
                  <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700">
                    {tc('delete')}
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        {languages.length === 0 && !showAdd && (
          <p className="py-2 text-sm text-neutral-400">Todavía no agregaste idiomas.</p>
        )}
      </div>

      {showAdd && (
        <div className="mt-3">
          <LanguageForm onClose={() => setShowAdd(false)} />
        </div>
      )}
    </SectionCard>
  )
}
