'use client'

import { type TextareaHTMLAttributes, forwardRef, useId, useState } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, showCount, maxLength, defaultValue, onChange, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const [count, setCount] = useState(() => String(defaultValue ?? '').length)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors resize-none',
            'border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-2">
          <div>
            {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          {showCount && maxLength && (
            <p className={cn('text-xs shrink-0', count >= maxLength ? 'text-red-500 font-medium' : 'text-neutral-400')}>
              {count}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
