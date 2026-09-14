import { cn, getInitials } from '@/lib/utils'

export function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = { xs: 'h-6 w-6 text-xs', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' }
  return (
    <div
      className={cn(
        'rounded-full bg-raised border border-border overflow-hidden flex items-center justify-center shrink-0',
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-medium text-text-muted">{getInitials(name)}</span>
      )}
    </div>
  )
}

export function AvatarGroup({ avatars, max = 4 }: { avatars: { src?: string; name: string }[]; max?: number }) {
  const shown = avatars.slice(0, max)
  const remaining = avatars.length - max
  return (
    <div className="flex -space-x-2">
      {shown.map((a, i) => (
        <Avatar key={i} src={a.src} name={a.name} size="sm" className="ring-2 ring-card" />
      ))}
      {remaining > 0 && (
        <div className="h-8 w-8 rounded-full bg-raised border border-border flex items-center justify-center text-xs text-text-muted ring-2 ring-card">
          +{remaining}
        </div>
      )}
    </div>
  )
}
