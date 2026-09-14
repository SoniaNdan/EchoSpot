import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatNumber } from '@/lib/utils'
import type { Contributor } from '@/types'
import { contributorMetrics } from '@/data/contributorMetrics'

export function ContributorCard({ contributor }: { contributor: Contributor }) {
  return (
    <Card hover sheen>
      <div className="flex items-start gap-4">
        <Avatar src={contributor.avatar} name={contributor.name} size="lg" />
        <div className="flex-1 min-w-0">
          <Link to={`/contributors/${contributor.id}`} className="font-heading font-semibold text-text-primary hover:text-echo-green transition-colors">
            {contributor.name}
          </Link>
          <p className="text-xs text-text-muted">@{contributor.username}</p>
          <p className="text-sm text-text-muted mt-2 line-clamp-2">{contributor.bio}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {contributor.skills.slice(0, 3).map((s) => (
              <Badge key={s} variant="outline">{s}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <span className="text-xs text-text-muted">{contributorMetrics.reputation.label}</span>
              <p className="font-mono text-sm text-accent-gold">{formatNumber(contributor.reputation)}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted">{contributorMetrics.echoPoints.label}</span>
              <p className="font-mono text-sm text-text-primary">{formatNumber(contributor.echoPoints)}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted">{contributorMetrics.level.label}</span>
              <p className="font-mono text-sm text-text-primary">{contributor.level}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function LeaderboardRow({
  rank,
  name,
  username,
  avatar,
  role,
  reputation,
  echoPoints,
  contributionScore,
  profileId,
}: {
  rank: number
  name: string
  username: string
  avatar: string
  role: string
  reputation: number
  echoPoints: number
  contributionScore: number
  profileId?: string
}) {
  const rankColors = ['text-accent-gold', 'text-text-secondary', 'text-text-tertiary']
  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-raised transition-colors">
      <span className={`font-heading text-lg font-bold w-8 text-center ${rankColors[rank - 1] ?? 'text-text-muted'}`}>
        {rank}
      </span>
      <Avatar src={avatar} name={name} size="md" />
      <div className="flex-1 min-w-0">
        {profileId ? <Link to={`/contributors/${profileId}`} className="text-sm font-medium text-text-primary hover:text-echo-green">{name}</Link> : <span className="text-sm font-medium text-text-primary">{name}</span>}
        <p className="text-xs text-text-muted">@{username} · {role}</p>
      </div>
      <div className="hidden sm:block text-right">
        <p className="font-mono text-sm text-accent-gold">{reputation.toLocaleString()}</p>
        <p className="text-xs text-text-muted">{contributorMetrics.reputation.label}</p>
      </div>
      <div className="hidden md:block text-right">
        <p className="font-mono text-sm text-text-primary">{echoPoints.toLocaleString()}</p>
        <p className="text-xs text-text-muted">{contributorMetrics.echoPoints.label}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-echo-green">{Math.round(contributionScore).toLocaleString()}</p>
        <p className="text-xs text-text-muted" title={contributorMetrics.leaderboardScore.meaning}>{contributorMetrics.leaderboardScore.label}</p>
      </div>
    </div>
  )
}

export function Podium({ entries }: { entries: { rank: number; name: string; avatar: string; score: number; profileId?: string }[] }) {
  const ordered = [entries[1], entries[0], entries[2]].filter(Boolean)
  const heights = ['h-24', 'h-32', 'h-20']
  const podiumRanks = [2, 1, 3]

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {ordered.map((entry, i) => (
        <div key={entry.rank} className="flex flex-col items-center gap-2">
          <Avatar src={entry.avatar} name={entry.name} size="lg" />
          {entry.profileId ? <Link to={`/contributors/${entry.profileId}`} className="text-sm font-medium text-text-primary hover:text-echo-green">{entry.name}</Link> : <span className="text-sm font-medium text-text-primary">{entry.name}</span>}
          <span className="font-mono text-sm text-accent-gold">{entry.score.toLocaleString()}</span>
          <div className={`w-24 ${heights[i]} bg-raised border border-border rounded-t-lg flex items-center justify-center`}>
            <span className={`font-heading text-2xl font-bold ${podiumRanks[i] === 1 ? 'text-accent-gold' : 'text-text-muted'}`}>
              {podiumRanks[i]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
