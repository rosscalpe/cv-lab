'use client'

import { useState, useTransition, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { upsertSkill, deleteSkill, bulkUpsertSkills } from '@/lib/supabase/profile-actions'
import type { Skill } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'

const LEVEL_BADGE: Record<string, string> = {
  basic: 'bg-neutral-100 text-neutral-600',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-green-50 text-green-700',
}

const LEVELS = ['basic', 'intermediate', 'advanced'] as const

interface PendingSkill {
  tempId: string
  name: string
  level: string
}

// ─── Chip de habilidad guardada ───────────────────────────────────────────────

function SavedSkillChip({
  skill,
  onEdit,
}: {
  skill: Skill
  onEdit: (id: string) => void
}) {
  const t = useTranslations('profile')
  return (
    <div className="group flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm">
      <span className="text-neutral-800">{skill.name}</span>
      {skill.level && (
        <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${LEVEL_BADGE[skill.level]}`}>
          {t(`levels.${skill.level}`)}
        </span>
      )}
      <button
        type="button"
        onClick={() => onEdit(skill.id)}
        className="hidden text-neutral-400 hover:text-blue-600 group-hover:inline"
      >
        ✎
      </button>
      <form action={deleteSkill.bind(null, skill.id)} className="inline">
        <button type="submit" className="hidden text-neutral-300 hover:text-red-500 group-hover:inline">
          ×
        </button>
      </form>
    </div>
  )
}

// ─── Formulario de edición (skill ya guardada) ────────────────────────────────

function EditSkillForm({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const t = useTranslations('profile')
  const tc = useTranslations('common')
  const [name, setName] = useState(skill.name)
  const [level, setLevel] = useState(skill.level ?? '')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('id', skill.id)
      fd.append('name', name)
      fd.append('level', level)
      await upsertSkill(null, fd)
      onClose()
    })
  }

  return (
    <div className="flex items-end gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-neutral-600">{t('skillName')}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-neutral-600">{t('skillLevel')}</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Sin nivel</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{t(`levels.${l}`)}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-1 pb-0.5">
        <Button size="sm" loading={isPending} onClick={handleSave}>{tc('save')}</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>{tc('cancel')}</Button>
      </div>
    </div>
  )
}

// ─── Sección principal ────────────────────────────────────────────────────────

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [pending, setPending] = useState<PendingSkill[]>([])
  const [inputName, setInputName] = useState('')
  const [inputLevel, setInputLevel] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, startTransition] = useTransition()
  const nameRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  const addToPending = () => {
    if (!inputName.trim()) return
    setPending((prev) => [
      ...prev,
      { tempId: crypto.randomUUID(), name: inputName.trim(), level: inputLevel },
    ])
    setInputName('')
    setInputLevel('')
    nameRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addToPending() }
  }

  const handleSave = () => {
    if (!pending.length) return
    setSaveError(null)
    startTransition(async () => {
      const result = await bulkUpsertSkills(
        pending.map((s) => ({ name: s.name, level: s.level || null })),
      )
      if (result?.success) {
        setPending([])
        setInputName('')
        setInputLevel('')
        setShowAdd(false)
      } else {
        setSaveError(result?.error ?? 'Error al guardar')
      }
    })
  }

  const handleCancel = () => {
    setPending([])
    setInputName('')
    setInputLevel('')
    setSaveError(null)
    setShowAdd(false)
  }

  return (
    <SectionCard
      title={t('skills')}
      headerAction={
        !showAdd && !editingId ? (
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
            + {tc('add')}
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {/* Skills guardadas */}
        {(skills.length > 0 || editingId) && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) =>
              editingId === skill.id ? (
                <div key={skill.id} className="w-full">
                  <EditSkillForm skill={skill} onClose={() => setEditingId(null)} />
                </div>
              ) : (
                <SavedSkillChip key={skill.id} skill={skill} onEdit={setEditingId} />
              ),
            )}
          </div>
        )}

        {skills.length === 0 && !showAdd && (
          <p className="text-sm text-neutral-400">Todavía no agregaste habilidades.</p>
        )}

        {/* Panel de agregar */}
        {showAdd && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 space-y-3">
            {/* Input row */}
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  {t('skillName')}
                </label>
                <input
                  ref={nameRef}
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="TypeScript"
                  autoFocus
                  className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  {t('skillLevel')}
                </label>
                <select
                  value={inputLevel}
                  onChange={(e) => setInputLevel(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Sin nivel</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{t(`levels.${l}`)}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addToPending}
                disabled={!inputName.trim()}
                className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white text-lg font-semibold text-neutral-600 transition-colors hover:border-blue-500 hover:text-blue-600 disabled:opacity-40"
                title="Agregar a la lista"
              >
                +
              </button>
            </div>

            {/* Skills pendientes de guardar */}
            {pending.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pending.map((s) => (
                  <div
                    key={s.tempId}
                    className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm"
                  >
                    <span className="text-blue-800">{s.name}</span>
                    {s.level && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                        {t(`levels.${s.level as typeof LEVELS[number]}`)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPending((p) => p.filter((x) => x.tempId !== s.tempId))}
                      className="text-blue-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!pending.length || isSaving}
                loading={isSaving}
              >
                {tc('save')} {pending.length > 0 && `(${pending.length})`}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                {tc('cancel')}
              </Button>
              {pending.length === 0 && (
                <p className="text-xs text-neutral-400">
                  Agregá habilidades con + o Enter
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
