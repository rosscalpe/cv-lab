import { CleanBasic } from './CleanBasic'
import { SimpleClassic } from './SimpleClassic'
import { SideColumn } from './SideColumn'
import { ModernBlue } from './ModernBlue'
import { ExecutiveDark } from './ExecutiveDark'
import { CreativeFlow } from './CreativeFlow'
import type { TemplateProps } from './shared'

export { CleanBasic, SimpleClassic, SideColumn, ModernBlue, ExecutiveDark, CreativeFlow }
export type { TemplateProps }

/** Registry: nombre de plantilla en BD → componente React */
export const TEMPLATE_REGISTRY: Record<string, React.ComponentType<TemplateProps>> = {
  'Clean Basic': CleanBasic,
  'Simple Classic': SimpleClassic,
  'Side Column': SideColumn,
  'Modern Blue': ModernBlue,
  'Executive Dark': ExecutiveDark,
  'Creative Flow': CreativeFlow,
}

/** Colores de acento para thumbnails en la galería */
export const TEMPLATE_ACCENT: Record<string, { bg: string; text: string }> = {
  'Clean Basic': { bg: '#f3f4f6', text: '#374151' },
  'Simple Classic': { bg: '#e0fdf4', text: '#0d9488' },
  'Side Column': { bg: '#f5f5f4', text: '#292524' },
  'Modern Blue': { bg: '#1d4ed8', text: '#ffffff' },
  'Executive Dark': { bg: '#0f172a', text: '#fef3c7' },
  'Creative Flow': { bg: '#fdf4ee', text: '#e07b3a' },
}

/** Opciones de color de acento por plantilla (vacío = no tiene personalización) */
export const TEMPLATE_COLORS: Record<string, Array<{ label: string; value: string }>> = {
  'Simple Classic': [
    { label: 'Teal',   value: '#0d9488' },
    { label: 'Azul',   value: '#2563eb' },
    { label: 'Rosa',   value: '#be185d' },
  ],
  'Side Column': [
    { label: 'Gris',   value: '#374151' },
    { label: 'Azul',   value: '#1e40af' },
    { label: 'Verde',  value: '#065f46' },
  ],
  'Modern Blue': [
    { label: 'Azul',   value: '#1d4ed8' },
    { label: 'Violeta', value: '#7c3aed' },
    { label: 'Teal',   value: '#0f766e' },
  ],
  'Executive Dark': [
    { label: 'Dorado',    value: '#b45309' },
    { label: 'Esmeralda', value: '#059669' },
    { label: 'Índigo',    value: '#4f46e5' },
  ],
  'Creative Flow': [
    { label: 'Naranja', value: '#e07b3a' },
    { label: 'Violeta', value: '#7c3aed' },
    { label: 'Teal',    value: '#0d9488' },
  ],
}
