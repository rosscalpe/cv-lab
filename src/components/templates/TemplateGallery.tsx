'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TemplateWithAccess } from '@/lib/supabase/template-queries'
import type { UserCVData, TemplateCategory } from '@/types/database'
import { TEMPLATE_ACCENT } from '@/components/pdf/templates'
import { TemplatePreviewModal } from './TemplatePreviewModal'
import { useTranslations } from 'next-intl'

interface Props {
  templates: TemplateWithAccess[]
  cvData: UserCVData
}

const FILTERS: { value: 'all' | TemplateCategory; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'modern', labelKey: 'modern' },
  { value: 'classic', labelKey: 'classic' },
  { value: 'creative', labelKey: 'creative' },
  { value: 'minimalist', labelKey: 'minimalist' },
]

function TemplateCard({
  template,
  onPreview,
  onSelect,
}: {
  template: TemplateWithAccess
  onPreview: () => void
  onSelect: () => void
}) {
  const t = useTranslations('templates')
  const accent = TEMPLATE_ACCENT[template.name] ?? { bg: '#f3f4f6', text: '#374151' }

  return (
    <div className="group relative rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div
        className="relative h-48 flex flex-col items-center justify-center cursor-pointer"
        style={{ background: accent.bg }}
        onClick={onPreview}
      >
        {/* Miniatura visual del template */}
        <div style={{ color: accent.text }} className="text-center px-4">
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            {template.name}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7, display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '3px', background: 'currentColor', opacity: 0.4, borderRadius: '2px' }} />
            <div style={{ width: '40px', height: '3px', background: 'currentColor', opacity: 0.3, borderRadius: '2px' }} />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
            {[80, 60, 70].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: '2px', background: 'currentColor', opacity: 0.25, borderRadius: '2px' }} />
            ))}
          </div>
        </div>

        {/* Badge Premium */}
        {template.is_premium && (
          <div className="absolute top-2 right-2">
            {template.hasAccess ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                ✓ {t('free')}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                🔒 ARS ${template.price_ars.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        )}
        {!template.is_premium && (
          <div className="absolute top-2 right-2">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {t('free')}
            </span>
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-neutral-900 shadow">
            {t('preview')} →
          </span>
        </div>
      </div>

      {/* Info + acciones */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-sm text-neutral-900">{template.name}</p>
            <p className="text-xs text-neutral-500 capitalize">{template.category}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {template.hasAccess ? (
            <button
              onClick={onSelect}
              className="w-full rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors"
              style={{ background: '#3d8ef0' }}
            >
              {t('select')}
            </button>
          ) : (
            <button
              onClick={onSelect}
              className="w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
            >
              🔒 ARS ${template.price_ars.toLocaleString('es-AR')}
            </button>
          )}
          <button
            onClick={onPreview}
            className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {t('preview')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TemplateGallery({ templates, cvData }: Props) {
  const [activeFilter, setActiveFilter] = useState<'all' | TemplateCategory>('all')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateWithAccess | null>(null)
  const router = useRouter()
  const t = useTranslations('templates')

  const filtered = activeFilter === 'all'
    ? templates
    : templates.filter((tmpl) => tmpl.category === activeFilter)

  const handleSelect = (template: TemplateWithAccess) => {
    router.push(`/export?templateId=${template.id}`)
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeFilter === f.value
                ? 'text-white'
                : 'bg-white border border-neutral-200 hover:bg-neutral-50',
            ].join(' ')}
            style={activeFilter === f.value ? { background: '#1e3458' } : { color: '#1e3458' }}
          >
            {t(`filters.${f.labelKey}`)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onPreview={() => setPreviewTemplate(template)}
            onSelect={() => handleSelect(template)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-neutral-400">
          No hay plantillas en esta categoría.
        </p>
      )}

      {/* Modal de preview */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          cvData={cvData}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  )
}
