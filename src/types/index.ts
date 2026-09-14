export type VerificationStatus = 'verified' | 'reviewed' | 'needs_review' | 'insufficient_data'
export type ProjectStage = 'idea' | 'mvp' | 'testnet' | 'mainnet' | 'scaling'
export type EchoScoreDimension = 'builder' | 'product' | 'community' | 'transparency' | 'risk'
export type ResearchType =
  | 'echo-intel'
  | 'project-spotlight'
  | 'founder-interview'
  | 'narrative-breakdown'
  | 'ecosystem-analysis'
  | 'educational-research'
export type NotificationCategory =
  | 'research'
  | 'projects'
  | 'contributions'
  | 'campaigns'
  | 'mentions'
  | 'rewards'
  | 'system'
export type UserRole = 'contributor' | 'founder' | 'admin' | 'researcher'

export interface EchoScore {
  overall: number
  builder: number
  product: number
  community: number
  transparency: number
  risk: number
}

export interface EchoCheckSection {
  id: EchoScoreDimension
  title: string
  score: number
  status: VerificationStatus
  summary: string
  evidence: string[]
  sources: { label: string; url: string }[]
  lastReviewed: string
  reviewer: string
}

export interface EchoCheckReport {
  projectId: string
  overallStatus: VerificationStatus
  progress: number
  lastUpdated: string
  sections: EchoCheckSection[]
  disclaimer: string
}

export interface Project {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  logo: string
  category: string
  chain: string
  stage: ProjectStage
  verificationStatus: VerificationStatus
  echoScore: EchoScore
  communityMetric: number
  researchStatus: 'published' | 'in_progress' | 'none'
  tags: string[]
  website?: string
  twitter?: string
  discord?: string
  github?: string
  featured?: boolean
  trending?: boolean
  addedAt: string
  problem?: string
  solution?: string
  technology?: string
  useCases?: string[]
  roadmap?: { quarter: string; title: string; status: 'completed' | 'in_progress' | 'planned' }[]
  team?: { name: string; role: string; avatar: string; bio?: string }[]
  risks?: { title: string; severity: 'low' | 'medium' | 'high'; description: string }[]
  updates?: { date: string; title: string; content: string }[]
  relatedProjectIds?: string[]
}

export interface ResearchArticle {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  author: string
  authorId: string
  authorAvatar: string
  date: string
  readTime: number
  category: ResearchType
  topic: string
  ecosystem: string
  status: 'published' | 'draft' | 'review'
  image: string
  bookmarked?: boolean
  projectId?: string
}

export interface Contributor {
  id: string
  username: string
  name: string
  avatar: string
  role: UserRole
  bio: string
  skills: string[]
  reputation: number
  echoPoints: number
  level: number
  badges: { id: string; name: string; icon: string; description: string }[]
  achievements: { id: string; title: string; date: string; description: string }[]
  contributions: { id: string; type: string; title: string; date: string; impact: number }[]
  articles: string[]
  projects: string[]
  leaderboardRank: number
  joinedAt: string
}

export interface Notification {
  id: string
  category: NotificationCategory
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
}

export interface LeaderboardEntry {
  rank: number
  contributorId: string
  name: string
  username: string
  avatar: string
  role: string
  reputation: number
  echoPoints: number
  contributionScore: number
}

export interface Campaign {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'draft'
  reach: number
  engagement: number
  participants: number
  startDate: string
  endDate?: string
}

export interface Reward {
  id: string
  title: string
  description: string
  points: number
  type: 'milestone' | 'achievement' | 'bounty' | 'benefit'
  opportunityType?: OpportunityType
  earnedAt?: string
  available: boolean
}

export type OpportunityType = 'bounty' | 'challenge' | 'unlock' | 'perk'

export interface BountyQuest {
  id: string
  title: string
  description: string
  points: number
  deadline: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  slots: number
  filled: number
}

export interface User {
  id: string
  email: string
  name: string
  username: string
  avatar: string
  role: UserRole
  walletAddress?: string
  echoPoints: number
  level: number
  reputation: number
}

export interface SearchResult {
  id: string
  type: 'project' | 'research' | 'contributor' | 'topic'
  title: string
  subtitle: string
  link: string
}

export interface AnalyticsPoint {
  date: string
  value: number
  label?: string
}
