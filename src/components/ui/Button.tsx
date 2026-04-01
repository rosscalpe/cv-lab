'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'text-white focus-visible:ring-blue-400',
  secondary:
    'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-400 border border-neutral-200',
  ghost:
    'text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-5 py-3 text-base h-12',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      style={variant === 'primary' ? { background: '#3d8ef0' } : undefined}
      onMouseEnter={(e) => {
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.background = '#2d7fe0'
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.background = '#3d8ef0'
        props.onMouseLeave?.(e)
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
