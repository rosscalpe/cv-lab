'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { upsertProject, deleteProject } from '@/lib/supabase/profile-actions'
import type { Project } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'

function ProjectForm({ item, onClose }: { item?: Project; onClose: () => void }) {
  const [state, action, isPending] = useActionState(upsertProject, null)
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
        label={t('projectName')}
        defaultValue={item?.name}
        required
        placeholder="Mi proyecto"
      />
      <Textarea
        name="description"
        label={t('description')}
        defaultValue={item?.description ?? ''}
        rows={2}
        placeholder="Describí el proyecto brevemente..."
      />
      <Input
        name="url"
        type="url"
        label={t('projectUrl')}
        defaultValue={item?.url ?? ''}
        placeholder="https://github.com/..."
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isPending}>{tc('save')}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>{tc('cancel')}</Button>
      </div>
    </form>
  )
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  return (
    <SectionCard
      title={t('projects')}
      headerAction={
        !showAdd && !editingId ? (
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
            + {tc('add')}
          </Button>
        ) : undefined
      }
    >
      <div className="divide-y divide-neutral-100">
        {projects.map((project) =>
          editingId === project.id ? (
            <div key={project.id} className="py-3">
              <ProjectForm item={project} onClose={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={project.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-900">{project.name}</p>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      ↗ Ver
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className="mt-0.5 text-sm text-neutral-500 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(project.id)}>
                  {tc('edit')}
                </Button>
                <form action={deleteProject.bind(null, project.id)}>
                  <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700">
                    {tc('delete')}
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        {projects.length === 0 && !showAdd && (
          <p className="py-2 text-sm text-neutral-400">Todavía no agregaste proyectos.</p>
        )}
      </div>

      {showAdd && (
        <div className="mt-3">
          <ProjectForm onClose={() => setShowAdd(false)} />
        </div>
      )}
    </SectionCard>
  )
}
