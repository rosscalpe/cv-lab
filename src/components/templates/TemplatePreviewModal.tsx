'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TEMPLATE_REGISTRY } from '@/components/pdf/templates'
import type { TemplateWithAccess } from '@/lib/supabase/template-queries'
import type { UserCVData } from '@/types/database'
import { Button } from '@/components/ui/Button'

interface Props {
  template: TemplateWithAccess
  cvData: UserCVData
  onClose: () => void
}

export function TemplatePreviewModal({ template, cvData, onClose }: Props) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const TemplateComponent = TEMPLATE_REGISTRY[template.name]

  const handleSelect = () => {
    router.push(`/export?templateId=${template.id}`)
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', overflow: 'hidden',
        width: '900px', maxWidth: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
      }}>
        {/* Header del modal */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-neutral-900">{template.name}</h2>
            <p className="text-xs text-neutral-500 capitalize">{template.category}</p>
          </div>
          <div className="flex items-center gap-3">
            {template.hasAccess ? (
              <Button onClick={handleSelect}>Usar esta plantilla →</Button>
            ) : (
              <Button onClick={() => router.push(`/export?templateId=${template.id}`)}>
                Desbloquear — {template.price_ars} ARS
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Preview del template */}
        <div className="overflow-auto bg-neutral-100 p-6" style={{ flex: 1 }}>
          {TemplateComponent ? (
            <div style={{ transformOrigin: 'top center', transform: 'scale(0.72)', width: '794px', margin: '0 auto' }}>
              <TemplateComponent data={cvData} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-neutral-400">
              Preview no disponible
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
