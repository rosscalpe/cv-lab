'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { TemplateWithAccess } from '@/lib/supabase/template-queries'
import type { UserCVData } from '@/types/database'
import { TEMPLATE_REGISTRY, TEMPLATE_COLORS } from '@/components/pdf/templates'
import { Button } from '@/components/ui/Button'

type PaymentProvider = 'stripe' | 'mercadopago'

interface Props {
  templates: TemplateWithAccess[]
  cvData: UserCVData
  defaultTemplateId?: string
  hasTranslationPackEN: boolean
  hasTranslationPackPT: boolean
  translationPackENId?: string
  translationPackPTId?: string
  paymentJustCompleted?: boolean
}

const LOCALES = [
  { value: 'es', label: 'Español', flag: '🇦🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
]

export function ExportForm({
  templates,
  cvData,
  defaultTemplateId,
  hasTranslationPackEN,
  hasTranslationPackPT,
  translationPackENId,
  translationPackPTId,
  paymentJustCompleted,
}: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(defaultTemplateId ?? templates[0]?.id ?? '')
  const [locale, setLocale] = useState('es')
  const [accentColor, setAccentColor] = useState<string | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const selectedTemplate = templates.find((t) => t.id === selectedId)
  const TemplateComponent = selectedTemplate ? TEMPLATE_REGISTRY[selectedTemplate.name] : null
  const colorOptions = selectedTemplate ? (TEMPLATE_COLORS[selectedTemplate.name] ?? []) : []

  const premiumAccess = !!(selectedTemplate?.is_premium && selectedTemplate?.hasAccess)

  const localeConfig: Record<string, { hasAccess: boolean; packId?: string }> = {
    es: { hasAccess: true },
    en: { hasAccess: premiumAccess || hasTranslationPackEN, packId: translationPackENId },
    pt: { hasAccess: premiumAccess || hasTranslationPackPT, packId: translationPackPTId },
  }

  const currentLocale = localeConfig[locale] ?? localeConfig.es
  const localeIsLocked = !currentLocale.hasAccess

  const handleUnlockTranslation = async () => {
    const packId = currentLocale.packId
    if (!packId) return
    setIsPaying(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: packId, returnTemplateId: selectedId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error iniciando el pago')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setIsPaying(false)
    }
  }

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id)
    setAccentColor(undefined)
  }

  const handleUnlock = async (provider: PaymentProvider) => {
    if (!selectedId) return
    setIsPaying(true)
    setError(null)
    try {
      const endpoint =
        provider === 'stripe'
          ? '/api/checkout/stripe'
          : '/api/checkout/mercadopago'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error iniciando el pago')

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setIsPaying(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedId || !selectedTemplate?.hasAccess) return
    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedId, locale, accentColor }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Error generando el PDF')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const namePart = [cvData.profile?.first_name, cvData.profile?.last_name]
        .filter(Boolean)
        .join('_')
      a.download = `CV_${namePart || 'CVLab'}_${locale}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (!paymentJustCompleted) return
    const timer = setTimeout(() => router.refresh(), 3000)
    return () => clearTimeout(timer)
  }, [paymentJustCompleted, router])

  const templateRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [estimatedPages, setEstimatedPages] = useState(1)
  const [previewScale, setPreviewScale] = useState(0.68)

  useEffect(() => {
    if (!templateRef.current) return
    const height = templateRef.current.scrollHeight
    setEstimatedPages(Math.ceil(height / 1123))
  })

  useEffect(() => {
    if (!previewContainerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      const containerWidth = entry.contentRect.width
      setPreviewScale(Math.min(0.68, containerWidth / 794))
    })
    observer.observe(previewContainerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
      {/* ── Preview en vivo ── */}
      <div ref={previewContainerRef} className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-inner">
        {TemplateComponent ? (
          <div
            ref={templateRef}
            style={{
              zoom: previewScale,
              width: '794px',
              pointerEvents: 'none',
            }}
          >
            <TemplateComponent data={cvData} accentColor={accentColor} />
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center text-neutral-400 text-sm">
            Seleccioná una plantilla para ver el preview
          </div>
        )}
      </div>

      {/* ── Controles ── */}
      <div className="space-y-6">
        {/* Banner pago procesando */}
        {paymentJustCompleted && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Verificando tu pago, un momento...
          </div>
        )}

        {/* Selector de plantilla */}
        <div>
          <p className="mb-2 text-sm font-medium" style={{ color: '#1e3458' }}>Plantilla</p>
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                style={selectedId === t.id ? { borderColor: '#3d8ef0', outline: '1px solid #3d8ef0' } : {}}
                className={[
                  'w-full rounded-lg border px-4 py-2.5 text-left transition-colors',
                  selectedId === t.id
                    ? 'bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">{t.name}</span>
                  {t.is_premium && !t.hasAccess ? (
                    <span className="text-xs font-medium text-amber-600">🔒 ARS ${t.price_ars.toLocaleString('es-AR')}</span>
                  ) : t.is_premium ? (
                    <span className="text-xs font-medium text-green-600">✓ Desbloqueada</span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Gratis</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs capitalize text-neutral-400">{t.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de color */}
        {colorOptions.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium" style={{ color: '#1e3458' }}>Color</p>
            <div className="flex gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  title={opt.label}
                  onClick={() => setAccentColor(accentColor === opt.value ? undefined : opt.value)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                      (accentColor ?? colorOptions[0].value) === opt.value
                        ? 'border-neutral-800 scale-110'
                        : 'border-transparent hover:scale-105',
                    ].join(' ')}
                    style={{ background: opt.value }}
                  >
                    {(accentColor ?? colorOptions[0].value) === opt.value && (
                      <svg className="h-3.5 w-3.5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <span className="text-xs text-neutral-500">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de idioma */}
        <div>
          <p className="mb-2 text-sm font-medium" style={{ color: '#1e3458' }}>Idioma del CV</p>
          <div className="flex gap-2">
            {LOCALES.map((l) => {
              const lc = localeConfig[l.value] ?? { hasAccess: true }
              const isLocked = !lc.hasAccess
              const showCheck = l.value === 'es' || lc.hasAccess
              return (
                <div key={l.value} className="relative flex-1 group">
                  <button
                    onClick={() => setLocale(l.value)}
                    className={[
                      'w-full flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-colors',
                      locale === l.value
                        ? 'border-[#3d8ef0] bg-blue-50 text-[#1e3458]'
                        : isLocked
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-400 hover:border-neutral-300'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300',
                    ].join(' ')}
                  >
                    <span className="text-base">{l.flag}</span>
                    {l.label}
                    {isLocked
                      ? <span className="text-[10px]">🔒</span>
                      : showCheck
                        ? <span className="text-[10px] text-green-600 font-normal">✓ incluído</span>
                        : null
                    }
                  </button>
                  {isLocked && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 hidden group-hover:block z-10">
                      <div className="whitespace-nowrap rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-white shadow-lg">
                        Desbloqueá por ARS $3.000
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {locale !== 'es' && !localeIsLocked && (
            <p className="mt-2 text-xs text-neutral-500">
              ✨ El contenido se traduce automáticamente con IA al generar el PDF
            </p>
          )}
        </div>

        {/* Feedback */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✓ PDF descargado correctamente
          </div>
        )}

        {/* Aviso de páginas */}
        {estimatedPages > 1 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <div className="flex items-start gap-2">
              <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="font-semibold mb-1">Tu CV ocupa ~{estimatedPages} páginas</p>
                <p>Para ajustarlo a 1 página, intentá resumir las descripciones de tus experiencias laborales.</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        {selectedTemplate?.is_premium && !selectedTemplate.hasAccess ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-amber-900">Plantilla premium</p>
              <p className="mt-1 text-xs text-amber-700">
                Desbloqueá "{selectedTemplate.name}" con acceso permanente
              </p>
            </div>
            <button
              onClick={() => handleUnlock('mercadopago')}
              disabled={isPaying}
              className="w-full flex items-center justify-between rounded-xl border-2 bg-white px-4 py-3 transition-colors hover:bg-slate-50 disabled:opacity-60"
              style={{ borderColor: '#1e3458' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/mercadopago.svg" alt="Mercado Pago" className="h-9 w-auto" />
              <div className="text-right">
                <p className="text-base font-bold" style={{ color: '#1e3458' }}>ARS ${selectedTemplate.price_ars.toLocaleString('es-AR')}</p>
                <p className="text-xs text-neutral-400">pago único · acceso permanente</p>
              </div>
            </button>
          </div>
        ) : localeIsLocked ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-[#1e3458]">
                Pack de idiomas · {locale === 'en' ? 'English' : 'Português'}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Exportá tu CV en este idioma con traducción automática por IA
              </p>
            </div>
            <button
              onClick={handleUnlockTranslation}
              disabled={isPaying || !currentLocale.packId}
              className="w-full flex items-center justify-between rounded-xl border-2 bg-white px-4 py-3 transition-colors hover:bg-slate-50 disabled:opacity-60"
              style={{ borderColor: '#1e3458' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/mercadopago.svg" alt="Mercado Pago" className="h-9 w-auto" />
              <div className="text-right">
                <p className="text-base font-bold" style={{ color: '#1e3458' }}>ARS $3.000</p>
                <p className="text-xs text-neutral-400">pago único · acceso permanente</p>
              </div>
            </button>
          </div>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={!selectedId || isGenerating}
            loading={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating
              ? locale !== 'es'
                ? 'Traduciendo y generando PDF...'
                : 'Generando PDF...'
              : '⬇ Generar y descargar PDF'}
          </Button>
        )}

        {/* Info */}
        <p className="text-center text-xs text-neutral-400">
          Formato A4 · PDF listo para imprimir o enviar
        </p>
      </div>
    </div>
  )
}
