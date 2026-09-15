import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg bg-canvas border border-border px-3 text-sm text-text-primary',
            'placeholder:text-text-disabled',
            'focus:outline-none focus:border-echo-green focus:ring-1 focus:ring-echo-green/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error/30',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export function PasswordInput({ className, label, error, id, ...props }: InputProps) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={cn(
            'h-10 w-full rounded-lg bg-canvas border border-border px-3 pr-10 text-sm text-text-primary',
            'placeholder:text-text-disabled',
            'focus:outline-none focus:border-echo-green focus:ring-1 focus:ring-echo-green/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error/30',
            className,
          )}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  )
}

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      <input
        className={cn(
          'h-10 w-full rounded-lg bg-canvas border border-border pl-9 pr-3 text-sm text-text-primary',
          'placeholder:text-text-disabled',
          'focus:outline-none focus:border-echo-green focus:ring-1 focus:ring-echo-green/30',
          className,
        )}
        {...props}
      />
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'h-10 rounded-lg bg-canvas border border-border px-3 text-sm text-text-primary',
          'focus:outline-none focus:border-echo-green focus:ring-1 focus:ring-echo-green/30',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Checkbox({
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 rounded border-border bg-canvas text-echo-green focus:ring-echo-green/30"
        {...props}
      />
      <span className="text-sm text-text-secondary">{label}</span>
    </label>
  )
}

export function Switch({
  label,
  checked,
  onChange,
  id,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span id={`${id}-label`} className="text-sm text-text-secondary">{label}</span>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-echo-green' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}
