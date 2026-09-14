import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TrendingUp, CheckCircle, Zap, Trophy } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { StatCard, ChartCard, Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/Progress'
import { ActivityItem } from '@/components/ui/Progress'
import { useAuth } from '@/contexts/AuthContext'
import { contributorAnalytics, bountyQuests } from '@/services'
import { contributors } from '@/data/contributors'
import { contributorMetrics } from '@/data/contributorMetrics'

export default function ContributorDashboardPage() {
  const { user } = useAuth()
  const contributor = contributors[0]

  return (
    <div className="max-w-[1280px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Contributor Dashboard</h1>
        <p className="text-text-muted mt-1">Welcome back, {user?.name ?? contributor.name}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard label={contributorMetrics.reputation.label} value={user?.reputation ?? contributor.reputation} change="+8.2%" icon={<Trophy className="h-4 w-4" />} />
        <StatCard label="Tasks Completed" value="47" change="+3" icon={<CheckCircle className="h-4 w-4" />} />
        <StatCard label="Recent Impact" value="1,240" change="+12%" icon={<Zap className="h-4 w-4" />} />
        <StatCard label={contributorMetrics.echoPoints.label} value={(user?.echoPoints ?? contributor.echoPoints).toLocaleString()} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <ChartCard title="Rewards Analytics" subtitle="EchoPoints earned over time">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={contributorAnalytics}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C58B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C58B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#545B69" fontSize={12} />
              <YAxis stroke="#545B69" fontSize={12} />
              <Tooltip contentStyle={{ background: '#15171C', border: '1px solid #262A33', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#22C58B" fill="url(#colorPoints)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Contribution Breakdown" subtitle="By category">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { name: 'Research', value: 18 },
              { name: 'EchoCheck', value: 12 },
              { name: 'Reviews', value: 10 },
              { name: 'Community', value: 7 },
            ]}>
              <XAxis dataKey="name" stroke="#545B69" fontSize={12} />
              <YAxis stroke="#545B69" fontSize={12} />
              <Tooltip contentStyle={{ background: '#15171C', border: '1px solid #262A33', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#4CC9E8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2">
          <h3 className="font-heading text-base font-semibold text-text-primary mb-4">Active Bounty Quests</h3>
          <div className="space-y-4">
            {bountyQuests.map((q) => (
              <div key={q.id} className="flex flex-col gap-4 p-4 rounded-lg bg-raised border border-border sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{q.title}</p>
                  <p className="text-xs text-text-muted mt-1">{q.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="gold">{q.points} pts</Badge>
                    <Badge variant="outline">{q.difficulty}</Badge>
                  </div>
                  <Link to="/rewards" className="inline-block text-xs text-echo-green hover:underline mt-3">View in Rewards</Link>
                </div>
                <div className="shrink-0 sm:ml-4 sm:text-right">
                  <p className="text-xs text-text-muted">{q.filled}/{q.slots} filled</p>
                  <ProgressBar value={(q.filled / q.slots) * 100} className="w-20 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-heading text-base font-semibold text-text-primary mb-4">Leaderboard Position</h3>
          <div className="text-center py-4">
            <span className="font-heading text-4xl font-bold text-accent-gold">#{contributor.leaderboardRank}</span>
            <p className="text-sm text-text-muted mt-2">Top Contributors</p>
            <Link to="/leaderboards" className="inline-block text-sm text-echo-green hover:underline mt-3">View Leaderboards</Link>
          </div>
          <div className="mt-4 space-y-1">
            <ActivityItem title="EchoCheck review approved" subtitle="Vertex Vaults" time="2h ago" />
            <ActivityItem title="Research published" subtitle="Aether Echo-Intel" time="1d ago" />
            <ActivityItem title="Bounty completed" subtitle="Community translation" time="3d ago" />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="font-heading text-base font-semibold text-text-primary mb-4">Recent Contributions</h3>
        <div className="space-y-2">
          {contributor.contributions.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm text-text-primary">{c.title}</p>
                <p className="text-xs text-text-muted">{c.type} · {c.date}</p>
              </div>
              <Badge variant="primary">+{c.impact} impact</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
