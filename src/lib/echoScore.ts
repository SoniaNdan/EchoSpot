import type { EchoScoreDimension } from '@/types'

export interface EchoScoreDimensionDefinition {
  key: EchoScoreDimension
  label: string
  scoreLabel: string
  description?: string
}

export const echoScoreDimensions = [
  { key: 'builder', label: 'Builder', scoreLabel: 'Builder Score', description: 'Team credentials and track record' },
  { key: 'product', label: 'Product', scoreLabel: 'Product Score', description: 'Live product maturity and usage' },
  { key: 'community', label: 'Community', scoreLabel: 'Community Score', description: 'Community size and engagement' },
  { key: 'transparency', label: 'Transparency', scoreLabel: 'Transparency Score', description: 'Documentation and disclosure quality' },
  { key: 'risk', label: 'Risk Management', scoreLabel: 'Risk Management Score', description: 'Identified risks and mitigations' },
] as const satisfies readonly EchoScoreDimensionDefinition[]

export function getEchoScoreDimensionListLabel() {
  const labels = echoScoreDimensions.map((dimension) => dimension.label)
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

type ScoreTone = 'high' | 'medium' | 'low'

interface ScoreStyle {
  textClassName: string
  strokeColor: string
  progressColor: 'green' | 'gold' | 'error'
}

const scoreStyles: Record<ScoreTone, ScoreStyle> = {
  high: { textClassName: 'text-echo-green', strokeColor: '#22C58B', progressColor: 'green' },
  medium: { textClassName: 'text-warning', strokeColor: '#E8A93B', progressColor: 'gold' },
  low: { textClassName: 'text-error', strokeColor: '#F0555A', progressColor: 'error' },
}

export function getScoreStyle(score: number): ScoreStyle {
  if (score >= 80) return scoreStyles.high
  if (score >= 60) return scoreStyles.medium
  return scoreStyles.low
}
