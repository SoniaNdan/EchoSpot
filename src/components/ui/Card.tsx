import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  sheen?: boolean
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function Card({ className, sheen, hover, padding = 'md', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl',
        sheen && 'card-sheen',
        hover && 'transition-colors hover:border-border-strong hover:bg-raised/50',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  change,
  icon,
  className,
}: {
  label: string
  value: string | number
  change?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="font-heading text-2xl font-semibold text-text-primary">{value}</span>
        {change && (
          <span className={cn('text-xs font-medium mb-1', change.startsWith('+') ? 'text-echo-green' : 'text-error')}>
            {change}
          </span>
        )}
      </div>
    </Card>
  )
}

export function MetricCard({
  title,
  value,
  subtitle,
  children,
  className,
}: {
  title: string
  value?: string | number
  subtitle?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm text-text-muted">{title}</h3>
          {value !== undefined && (
            <p className="font-heading text-2xl font-semibold text-text-primary mt-1">{value}</p>
          )}
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  )
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-heading text-base font-semibold text-text-primary">{title}</h3>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}
