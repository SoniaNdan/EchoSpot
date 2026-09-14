import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/types'
import { getScoreStyle } from '@/lib/echoScore'
import { getVerificationStatusDefinition } from '@/lib/verification'

const badgeVariants = {
  default: 'bg-raised text-text-secondary border-border',
  primary: 'bg-echo-green-muted text-echo-green border-echo-green/30',
  secondary: 'bg-info-bg text-signal-indigo border-signal-indigo/30',
  gold: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
  coral: 'bg-accent-coral/10 text-accent-coral border-accent-coral/30',
  outline: 'bg-transparent text-text-tertiary border-border',
} as const

interface BadgeProps {
  children: React.ReactNode
  variant?: keyof typeof badgeVariants
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  const definition = getVerificationStatusDefinition(status)

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', definition.badgeClassName)}>
      {definition.label}
    </span>
  )
}

export function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const { textClassName } = getScoreStyle(score)
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base font-semibold' }
  return (
    <span className={cn('font-mono tabular-nums', textClassName, sizes[size])}>
      {score}
    </span>
  )
}
