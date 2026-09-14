import { cn } from '@/lib/utils'
import { getScoreStyle } from '@/lib/echoScore'

export function ProgressBar({ value, max = 100, className, color = 'green' }: {
  value: number
  max?: number
  className?: string
  color?: 'green' | 'indigo' | 'gold' | 'cyan' | 'error'
}) {
  const pct = Math.min(100, (value / max) * 100)
  const colors = {
    green: 'bg-echo-green',
    indigo: 'bg-signal-indigo',
    gold: 'bg-accent-gold',
    cyan: 'bg-accent-cyan',
    error: 'bg-error',
  }
  return (
    <div className={cn('h-2 w-full bg-raised rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  )
}

export function ScoreRing({
  score,
  size = 80,
  label,
  sublabel,
}: {
  score: number
  size?: number
  label?: string
  sublabel?: string
}) {
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const { strokeColor } = getScoreStyle(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#262A33" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-xl font-semibold text-text-primary">{score}</span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
      {sublabel && <span className="text-xs text-text-muted">{sublabel}</span>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-raised rounded', className)} />
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-text-muted mb-4">{icon}</div>}
      <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
      {description && <p className="text-sm text-text-muted mt-2 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <svg className="animate-spin h-8 w-8 text-echo-green" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="font-heading text-lg font-semibold text-error">{title}</h3>
      {description && <p className="text-sm text-text-muted mt-2">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-4 text-sm text-echo-green hover:underline">
          Try again
        </button>
      )}
    </div>
  )
}

export function Timeline({ items }: { items: { date: string; title: string; description?: string; status?: 'completed' | 'in_progress' | 'planned' }[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              'h-3 w-3 rounded-full border-2',
              item.status === 'completed' ? 'bg-echo-green border-echo-green' :
              item.status === 'in_progress' ? 'bg-signal-indigo border-signal-indigo' :
              'bg-transparent border-border',
            )} />
            {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-6">
            <span className="text-xs text-text-muted">{item.date}</span>
            <h4 className="text-sm font-medium text-text-primary mt-0.5">{item.title}</h4>
            {item.description && <p className="text-sm text-text-muted mt-1">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityItem({
  icon,
  title,
  subtitle,
  time,
}: {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      {icon && <div className="text-text-muted mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary">{title}</p>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <span className="text-xs text-text-muted whitespace-nowrap">{time}</span>
    </div>
  )
}
