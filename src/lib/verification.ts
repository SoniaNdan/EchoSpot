import type { VerificationStatus } from '@/types'

interface VerificationStatusDefinition {
  label: string
  description: string
  badgeClassName: string
}

export const verificationStatusDefinitions: Record<VerificationStatus, VerificationStatusDefinition> = {
  verified: {
    label: 'Verified',
    description: 'EchoCheck assessment completed and available evidence satisfies EchoSpot verification criteria.',
    badgeClassName: 'bg-success-bg text-success border-success/30',
  },
  reviewed: {
    label: 'Reviewed',
    description: 'The project or assessment has been reviewed but does not currently carry full Verified status.',
    badgeClassName: 'bg-info-bg text-signal-indigo border-signal-indigo/30',
  },
  needs_review: {
    label: 'Needs Review',
    description: 'The project has been indexed or submitted but still requires review.',
    badgeClassName: 'bg-warning-bg text-warning border-warning/30',
  },
  insufficient_data: {
    label: 'Insufficient Data',
    description: 'Available evidence is insufficient for a reliable assessment.',
    badgeClassName: 'bg-raised text-text-muted border-border',
  },
}

export const verificationStatusOptions = (Object.keys(verificationStatusDefinitions) as VerificationStatus[]).map((value) => ({
  value,
  label: verificationStatusDefinitions[value].label,
}))

export function getVerificationStatusDefinition(status: VerificationStatus) {
  return verificationStatusDefinitions[status]
}
