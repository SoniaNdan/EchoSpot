import { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge, ScoreBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/Progress'
import { echoScoreDimensions, getScoreStyle } from '@/lib/echoScore'
import { formatDate } from '@/lib/utils'
import type { EchoCheckReport, EchoCheckSection, EchoScore } from '@/types'

export function EchoCheckOverview({ report }: { report: EchoCheckReport }) {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">EchoCheck Report</h2>
          <p className="text-sm text-text-muted mt-1">Last updated {formatDate(report.lastUpdated)}</p>
        </div>
        <StatusBadge status={report.overallStatus} />
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">Assessment Completion</span>
          <span className="text-sm font-mono text-text-primary">{report.progress}%</span>
        </div>
        <ProgressBar value={report.progress} color="green" />
      </div>
      <p className="text-xs text-text-muted bg-raised rounded-lg p-3 border border-border">
        {report.disclaimer}
      </p>
    </Card>
  )
}

export function EchoCheckSectionCard({ section }: { section: EchoCheckSection }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-4">
          <ScoreBadge score={section.score} size="lg" />
          <div>
            <h3 className="font-heading text-base font-semibold text-text-primary">{section.title}</h3>
            <StatusBadge status={section.status} />
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <p className="text-sm text-text-muted mt-4">{section.summary}</p>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Evidence</h4>
            <ul className="space-y-1">
              {section.evidence.map((e, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-echo-green mt-1">•</span>{e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {section.sources.map((s, i) => (
                <a key={i} href={s.url} className="inline-flex items-center gap-1 text-xs text-echo-green hover:underline">
                  {s.label} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Reviewed by {section.reviewer}</span>
            <span>{formatDate(section.lastReviewed)}</span>
          </div>
        </div>
      )}
    </Card>
  )
}

export function EchoScoreBreakdown({ scores }: { scores: EchoScore }) {
  const items = echoScoreDimensions.map((dimension) => ({
    ...dimension,
    score: scores[dimension.key],
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.key} padding="sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">{item.scoreLabel}</span>
            <ScoreBadge score={item.score} size="lg" />
          </div>
          <ProgressBar value={item.score} color={getScoreStyle(item.score).progressColor} className="mb-2" />
          {item.description && <p className="text-xs text-text-muted">{item.description}</p>}
        </Card>
      ))}
    </div>
  )
}
