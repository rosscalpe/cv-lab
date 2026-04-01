import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors',
            'border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error &&
              'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-neutral-500">{hint}</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
