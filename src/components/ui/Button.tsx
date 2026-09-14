import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-echo-green text-canvas hover:bg-echo-green-hover active:bg-echo-green-active',
  secondary: 'bg-raised text-text-primary border border-border hover:bg-border/50',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-raised',
  outline: 'border border-border text-text-secondary hover:border-echo-green hover:text-echo-green',
  danger: 'bg-error/10 text-error border border-error/30 hover:bg-error/20',
  gold: 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/20',
} as const

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

export function IconButton({
  className,
  children,
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center h-9 w-9 rounded-lg',
        'text-text-muted hover:text-text-primary hover:bg-raised transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
