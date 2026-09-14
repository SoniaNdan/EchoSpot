import type { Contributor, LeaderboardEntry, BountyQuest } from '@/types'

export const contributors: Contributor[] = [
  {
    id: '1',
    username: 'sarahm',
    name: 'Sarah Mitchell',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: 'researcher',
    bio: 'Senior protocol researcher specializing in DePIN and compute infrastructure. Former analyst at a major crypto fund.',
    skills: ['Research', 'Technical Writing', 'EchoCheck', 'Data Analysis'],
    reputation: 2840,
    echoPoints: 15600,
    level: 12,
    badges: [
      { id: 'b1', name: 'Top Researcher', icon: '🔬', description: 'Published 10+ Echo-Intel reports' },
      { id: 'b2', name: 'Verification Expert', icon: '✓', description: 'Completed 25 EchoCheck reviews' },
    ],
    achievements: [
      { id: 'a1', title: 'First Echo-Intel Published', date: '2025-06-15', description: 'Published first in-depth protocol analysis' },
      { id: 'a2', title: '100 Reviews Milestone', date: '2025-12-01', description: 'Completed 100 community reviews' },
    ],
    contributions: [
      { id: 'c1', type: 'Research', title: 'Aether Protocol Echo-Intel', date: '2026-01-28', impact: 450 },
      { id: 'c2', type: 'EchoCheck', title: 'Sentinel Guardian Verification', date: '2026-01-15', impact: 380 },
      { id: 'c3', type: 'Review', title: 'Vertex Vaults Community Review', date: '2026-02-05', impact: 120 },
    ],
    articles: ['1', '3'],
    projects: ['1', '4'],
    leaderboardRank: 1,
    joinedAt: '2025-03-10',
  },
  {
    id: '2',
    username: 'jameso',
    name: 'James Okonkwo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    role: 'researcher',
    bio: 'DeFi analyst and ecosystem researcher. Focuses on yield transparency and risk frameworks.',
    skills: ['DeFi Analysis', 'Risk Assessment', 'Writing', 'Data Visualization'],
    reputation: 2150,
    echoPoints: 12400,
    level: 10,
    badges: [
      { id: 'b3', name: 'DeFi Specialist', icon: '📊', description: 'Expert in DeFi ecosystem analysis' },
    ],
    achievements: [
      { id: 'a3', title: 'Ecosystem Report Series', date: '2025-09-20', description: 'Published 5 ecosystem analysis reports' },
    ],
    contributions: [
      { id: 'c4', type: 'Research', title: 'DeFi Yield Transparency Framework', date: '2026-02-03', impact: 320 },
    ],
    articles: ['2', '5'],
    projects: ['2'],
    leaderboardRank: 2,
    joinedAt: '2025-04-22',
  },
  {
    id: '3',
    username: 'alexr',
    name: 'Alex Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    role: 'contributor',
    bio: 'Technical writer and narrative analyst. Breaks down complex protocol mechanics for broader audiences.',
    skills: ['Technical Writing', 'Narrative Analysis', 'Community'],
    reputation: 1680,
    echoPoints: 9800,
    level: 8,
    badges: [
      { id: 'b4', name: 'Storyteller', icon: '✍️', description: 'Published 5 narrative breakdowns' },
    ],
    achievements: [],
    contributions: [
      { id: 'c5', type: 'Research', title: 'Oracle Manipulation Breakdown', date: '2026-01-20', impact: 280 },
    ],
    articles: ['4', '6'],
    projects: ['5', '3'],
    leaderboardRank: 3,
    joinedAt: '2025-07-01',
  },
  {
    id: '4',
    username: 'mayak',
    name: 'Maya Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',
    role: 'contributor',
    bio: 'UI/UX designer contributing to EchoSpot\'s design system and project page templates.',
    skills: ['UI Design', 'UX Research', 'Figma', 'Design Systems'],
    reputation: 1420,
    echoPoints: 8200,
    level: 7,
    badges: [
      { id: 'b5', name: 'Design Contributor', icon: '🎨', description: 'Contributed to design system' },
    ],
    achievements: [],
    contributions: [
      { id: 'c6', type: 'Design', title: 'Project Card Component System', date: '2026-01-10', impact: 200 },
    ],
    articles: [],
    projects: [],
    leaderboardRank: 4,
    joinedAt: '2025-08-15',
  },
  {
    id: '5',
    username: 'davidw',
    name: 'David Walsh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    role: 'contributor',
    bio: 'Community moderator and bounty hunter. Active in Discord and Telegram community management.',
    skills: ['Community', 'Moderation', 'Social Media'],
    reputation: 980,
    echoPoints: 5600,
    level: 5,
    badges: [],
    achievements: [],
    contributions: [
      { id: 'c7', type: 'Community', title: 'Discord Moderation — January', date: '2026-01-31', impact: 150 },
    ],
    articles: [],
    projects: [],
    leaderboardRank: 5,
    joinedAt: '2025-10-01',
  },
]

export const leaderboardCategories = [
  { id: 'contributors', label: 'Top Contributors' },
  { id: 'researchers', label: 'Top Researchers' },
  { id: 'designers', label: 'Top Designers' },
  { id: 'writers', label: 'Top Writers' },
  { id: 'communities', label: 'Top Communities' },
] as const

export const leaderboards: Record<string, LeaderboardEntry[]> = {
  contributors: contributors.map((c, i) => ({
    rank: i + 1,
    contributorId: c.id,
    name: c.name,
    username: c.username,
    avatar: c.avatar,
    role: 'Contributor',
    reputation: c.reputation,
    echoPoints: c.echoPoints,
    contributionScore: c.reputation + c.echoPoints / 10,
  })),
  researchers: contributors
    .filter((c) => c.role === 'researcher')
    .map((c, i) => ({
      rank: i + 1,
      contributorId: c.id,
      name: c.name,
      username: c.username,
      avatar: c.avatar,
      role: 'Researcher',
      reputation: c.reputation,
      echoPoints: c.echoPoints,
      contributionScore: c.reputation + c.echoPoints / 10,
    })),
  designers: [
    { rank: 1, contributorId: '4', name: 'Maya Kim', username: 'mayak', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya', role: 'Designer', reputation: 1420, echoPoints: 8200, contributionScore: 2240 },
  ],
  writers: contributors
    .slice(0, 3)
    .map((c, i) => ({
      rank: i + 1,
      contributorId: c.id,
      name: c.name,
      username: c.username,
      avatar: c.avatar,
      role: 'Writer',
      reputation: c.reputation,
      echoPoints: c.echoPoints,
      contributionScore: c.reputation + c.echoPoints / 10,
    })),
  communities: [
    { rank: 1, contributorId: 'c1', name: 'Aether Community', username: 'aether', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=aether', role: 'Community', reputation: 3200, echoPoints: 45000, contributionScore: 7700 },
    { rank: 2, contributorId: 'c2', name: 'Sentinel Guardians', username: 'sentinel', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=sentinel', role: 'Community', reputation: 2800, echoPoints: 38000, contributionScore: 6600 },
  ],
}

export const bountyQuests: BountyQuest[] = [
  {
    id: 'q1',
    title: 'EchoCheck Review: Nova Compute',
    description: 'Complete a full EchoCheck assessment of Nova Compute testnet metrics and team credentials.',
    points: 500,
    deadline: '2026-03-15',
    category: 'EchoCheck',
    difficulty: 'hard',
    slots: 3,
    filled: 1,
  },
  {
    id: 'q2',
    title: 'Research Article: L2 Sequencer Decentralization',
    description: 'Write an ecosystem analysis comparing sequencer decentralization across major L2 networks.',
    points: 350,
    deadline: '2026-03-01',
    category: 'Research',
    difficulty: 'medium',
    slots: 5,
    filled: 2,
  },
  {
    id: 'q3',
    title: 'Community Translation: EchoCheck Docs',
    description: 'Translate EchoCheck documentation into Spanish, Portuguese, or Korean.',
    points: 150,
    deadline: '2026-02-28',
    category: 'Community',
    difficulty: 'easy',
    slots: 10,
    filled: 4,
  },
]

export function getContributorById(id: string): Contributor | undefined {
  return contributors.find((c) => c.id === id)
}
