import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Star, Trophy, Target } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { rewards, levelThresholds } from '@/services'
import { contributorMetrics } from '@/data/contributorMetrics'

export default function RewardsPage() {
  const { user } = useAuth()
  const [inProgressBounties, setInProgressBounties] = useState<Set<string>>(new Set())
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null)
  const level = user?.level ?? 12
  const points = user?.echoPoints ?? 15600
  const currentThreshold = levelThresholds.find((l) => l.level === level)
  const nextThreshold = levelThresholds.find((l) => l.level === level + 1)
  const progress = nextThreshold && currentThreshold
    ? ((points - currentThreshold.points) / (nextThreshold.points - currentThreshold.points)) * 100
    : 100

  const opportunityAction = {
    bounty: 'Start',
    challenge: 'View progress',
    unlock: 'View requirements',
    perk: 'View access',
  } as const

  function handleOpportunityAction(id: string, type: keyof typeof opportunityAction) {
    if (type === 'bounty') {
      setInProgressBounties((current) => new Set(current).add(id))
      return
    }
    setExpandedOpportunity((current) => current === id ? null : id)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Gift className="h-8 w-8 text-accent-gold" />
          <h1 className="font-heading text-3xl font-semibold text-text-primary">EchoRewards</h1>
        </div>
        <p className="text-text-muted mt-2">Track your contributions, milestones, and ecosystem benefits.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card sheen className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-text-muted">Current Level</p>
              <p className="font-heading text-4xl font-bold text-accent-gold">Level {level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">{contributorMetrics.echoPoints.label}</p>
              <p className="font-mono text-2xl text-text-primary">{points.toLocaleString()}</p>
            </div>
          </div>
          <ProgressBar value={progress} color="gold" className="mb-2" />
          <p className="text-xs text-text-muted">
            {nextThreshold ? `${(nextThreshold.points - points).toLocaleString()} EchoPoints remaining to Level ${level + 1}` : 'Max level reached'}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-accent-gold" />
            <span className="text-sm text-text-muted">Leaderboard</span>
          </div>
          <p className="font-heading text-3xl font-bold text-text-primary">#1</p>
          <p className="text-xs text-text-muted mt-1">Top Contributors</p>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">Achievement Vault</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.filter((r) => r.type === 'achievement' || r.type === 'milestone').map((r) => (
            <Card key={r.id} padding="sm" className={r.earnedAt ? 'border-accent-gold/30' : ''}>
              <div className="flex items-start gap-3">
                <Star className={`h-5 w-5 shrink-0 ${r.earnedAt ? 'text-accent-gold' : 'text-text-muted'}`} />
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.title}</p>
                  <p className="text-xs text-text-muted mt-1">{r.description}</p>
                  {r.earnedAt && <Badge variant="gold" className="mt-2">Earned {r.earnedAt}</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">Available Opportunities</h2>
        <div className="space-y-4">
          {rewards.filter((r) => r.available && !r.earnedAt).map((r) => {
            const opportunityType = r.opportunityType ?? 'bounty'
            const started = inProgressBounties.has(r.id)
            return (
            <Card key={r.id} hover>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-echo-green" />
                  <div>
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-text-primary">{r.title}</p><Badge variant="outline">{opportunityType[0].toUpperCase() + opportunityType.slice(1)}</Badge></div>
                    <p className="text-xs text-text-muted">{r.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {r.points > 0 && <Badge variant="gold">{r.points} pts</Badge>}
                  <Button size="sm" variant={started ? 'secondary' : 'primary'} disabled={started} onClick={() => handleOpportunityAction(r.id, opportunityType)}>{started ? 'In Progress' : opportunityAction[opportunityType]}</Button>
                </div>
              </div>
              {expandedOpportunity === r.id && <div className="mt-4 border-t border-border pt-3 text-xs text-text-muted">{r.description}</div>}
            </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
