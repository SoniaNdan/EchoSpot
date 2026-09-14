import type { Notification, Reward, Campaign, AnalyticsPoint } from '@/types'

export const notifications: Notification[] = [
  {
    id: '1',
    category: 'research',
    title: 'New Echo-Intel Published',
    message: 'Sarah Mitchell published "Inside Aether Protocol: Verifying Decentralized Compute at Scale"',
    timestamp: '2026-02-14T10:30:00Z',
    read: false,
    link: '/research/aether-compute-verification-model',
  },
  {
    id: '2',
    category: 'projects',
    title: 'Project Verified',
    message: 'Sentinel Guardian has been verified through EchoCheck with a score of 91.',
    timestamp: '2026-02-13T15:45:00Z',
    read: false,
    link: '/projects/sentinel-guardian',
  },
  {
    id: '3',
    category: 'contributions',
    title: 'Contribution Approved',
    message: 'Your EchoCheck review for Vertex Vaults has been approved. +120 EchoPoints earned.',
    timestamp: '2026-02-12T09:00:00Z',
    read: true,
    link: '/dashboard/contributor',
  },
  {
    id: '4',
    category: 'campaigns',
    title: 'New Bounty Available',
    message: 'EchoCheck Review: Nova Compute — 500 EchoPoints bounty now open.',
    timestamp: '2026-02-11T14:20:00Z',
    read: false,
    link: '/rewards',
  },
  {
    id: '5',
    category: 'mentions',
    title: 'You were mentioned',
    message: 'James Okonkwo mentioned you in a research discussion about DeFi yield transparency.',
    timestamp: '2026-02-10T11:15:00Z',
    read: true,
  },
  {
    id: '6',
    category: 'rewards',
    title: 'Level Up!',
    message: 'Congratulations! You reached Level 12 Contributor.',
    timestamp: '2026-02-09T08:00:00Z',
    read: true,
    link: '/rewards',
  },
  {
    id: '7',
    category: 'system',
    title: 'Platform Update',
    message: 'EchoSpot v2.1 released with improved EchoCheck dashboard and mobile navigation.',
    timestamp: '2026-02-08T16:00:00Z',
    read: true,
  },
]

export const rewards: Reward[] = [
  { id: 'r1', title: 'First Research Published', description: 'Published your first Echo-Intel report', points: 500, type: 'milestone', earnedAt: '2025-06-15', available: false },
  { id: 'r2', title: 'EchoCheck Expert', description: 'Completed 10 EchoCheck reviews', points: 300, type: 'achievement', earnedAt: '2025-10-01', available: false },
  { id: 'r3', title: 'Community Champion', description: 'Top 10 contributor for 3 consecutive months', points: 1000, type: 'achievement', opportunityType: 'challenge', available: true },
  { id: 'r4', title: 'Research Bounty: Nova Compute', description: 'Complete EchoCheck review of Nova Compute', points: 500, type: 'bounty', opportunityType: 'bounty', available: true },
  { id: 'r5', title: 'Early Access: EchoCheck API', description: 'Beta access to EchoCheck programmatic API', points: 0, type: 'benefit', opportunityType: 'perk', available: true },
  { id: 'r6', title: 'Verified Contributor Badge', description: 'Unlock verified contributor profile badge', points: 200, type: 'milestone', opportunityType: 'unlock', available: true },
]

export const campaigns: Campaign[] = [
  { id: 'c1', title: 'Q1 Research Sprint', description: 'Focused research campaign on DePIN infrastructure projects', status: 'active', reach: 45000, engagement: 12.4, participants: 28, startDate: '2026-01-01', endDate: '2026-03-31' },
  { id: 'c2', title: 'EchoCheck Awareness', description: 'Community education campaign about verification framework', status: 'active', reach: 82000, engagement: 8.7, participants: 156, startDate: '2026-01-15' },
  { id: 'c3', title: 'Founder Onboarding Drive', description: 'Outreach to early-stage Web3 founders for project submissions', status: 'completed', reach: 12000, engagement: 15.2, participants: 42, startDate: '2025-10-01', endDate: '2025-12-31' },
]

export const contributorAnalytics: AnalyticsPoint[] = [
  { date: '2026-01', value: 1200, label: 'Jan' },
  { date: '2026-02', value: 1450, label: 'Feb' },
  { date: '2026-03', value: 1380, label: 'Mar' },
  { date: '2026-04', value: 1620, label: 'Apr' },
  { date: '2026-05', value: 1890, label: 'May' },
  { date: '2026-06', value: 2100, label: 'Jun' },
  { date: '2026-07', value: 1950, label: 'Jul' },
  { date: '2026-08', value: 2340, label: 'Aug' },
]

export const founderAnalytics = {
  visibilityScore: 78,
  communityGrowth: [
    { date: 'Jan', value: 8200 },
    { date: 'Feb', value: 9400 },
    { date: 'Mar', value: 10200 },
    { date: 'Apr', value: 11100 },
    { date: 'May', value: 11800 },
    { date: 'Jun', value: 12400 },
  ],
  campaignReach: [
    { date: 'Jan', value: 12000 },
    { date: 'Feb', value: 18500 },
    { date: 'Mar', value: 24000 },
    { date: 'Apr', value: 31000 },
    { date: 'May', value: 38000 },
    { date: 'Jun', value: 45000 },
  ],
  engagement: [
    { name: 'Research Views', value: 4200 },
    { name: 'Profile Visits', value: 2800 },
    { name: 'Social Shares', value: 1200 },
    { name: 'Follows', value: 890 },
  ],
}

export const adminAnalytics = {
  totalUsers: 12450,
  totalProjects: 342,
  totalResearch: 189,
  activeCampaigns: 8,
  pendingReviews: 23,
  systemHealth: 99.7,
  recentActivity: [
    { id: '1', action: 'New project submitted', user: 'Global Mesh', time: '2 min ago' },
    { id: '2', action: 'EchoCheck completed', user: 'Sarah Mitchell', time: '15 min ago' },
    { id: '3', action: 'User registered', user: 'newuser42', time: '32 min ago' },
    { id: '4', action: 'Research published', user: 'James Okonkwo', time: '1 hr ago' },
    { id: '5', action: 'Campaign created', user: 'Admin', time: '2 hr ago' },
  ],
  userGrowth: [
    { date: 'Sep', value: 8200 },
    { date: 'Oct', value: 9100 },
    { date: 'Nov', value: 10200 },
    { date: 'Dec', value: 11100 },
    { date: 'Jan', value: 11800 },
    { date: 'Feb', value: 12450 },
  ],
}

export const levelThresholds = [
  { level: 1, points: 0 },
  { level: 2, points: 500 },
  { level: 3, points: 1200 },
  { level: 4, points: 2500 },
  { level: 5, points: 4500 },
  { level: 6, points: 7000 },
  { level: 7, points: 10000 },
  { level: 8, points: 14000 },
  { level: 9, points: 19000 },
  { level: 10, points: 25000 },
  { level: 11, points: 32000 },
  { level: 12, points: 40000 },
  { level: 13, points: 50000 },
]
