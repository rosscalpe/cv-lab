import { type SelectHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors',
            'border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
