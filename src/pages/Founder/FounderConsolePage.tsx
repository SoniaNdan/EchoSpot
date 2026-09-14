import { useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Eye, FileText, Megaphone, Users } from 'lucide-react'
import { StatCard, ChartCard, Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/Progress'
import { Tabs } from '@/components/ui/Tabs'
import { founderAnalytics, campaigns } from '@/services'

const COLORS = ['#22C58B', '#4CC9E8', '#6C74F1', '#E8B84B']

export default function FounderConsolePage() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="max-w-[1280px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Founder Console</h1>
        <p className="text-text-muted mt-1">Manage project visibility, campaigns, and research requests.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard label="Visibility Score" value={founderAnalytics.visibilityScore} change="+5.2%" icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Community Growth" value="12.4K" change="+14%" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Campaign Reach" value="45K" change="+22%" icon={<Megaphone className="h-4 w-4" />} />
        <StatCard label="Research Queue" value="3" icon={<FileText className="h-4 w-4" />} />
      </div>

      <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'campaigns', label: 'Campaigns' }, { id: 'research', label: 'Research Requests' }]} active={tab} onChange={setTab} className="mt-8" />

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <ChartCard title="Community Growth" subtitle="Monthly active community members">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={founderAnalytics.communityGrowth}>
                <XAxis dataKey="date" stroke="#545B69" fontSize={12} />
                <YAxis stroke="#545B69" fontSize={12} />
                <Tooltip contentStyle={{ background: '#15171C', border: '1px solid #262A33', borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="#22C58B" fill="#22C58B20" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Engagement Breakdown">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={founderAnalytics.engagement} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {founderAnalytics.engagement.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#15171C', border: '1px solid #262A33', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {tab === 'campaigns' && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {campaigns.map((c) => (
            <Card key={c.id} hover>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-text-primary">{c.title}</h3>
                <Badge variant={c.status === 'active' ? 'primary' : 'outline'}>{c.status}</Badge>
              </div>
              <p className="text-xs text-text-muted">{c.description}</p>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div><p className="text-xs text-text-muted">Reach</p><p className="font-mono text-sm">{c.reach.toLocaleString()}</p></div>
                <div><p className="text-xs text-text-muted">Engagement</p><p className="font-mono text-sm">{c.engagement}%</p></div>
                <div><p className="text-xs text-text-muted">Participants</p><p className="font-mono text-sm">{c.participants}</p></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'research' && (
        <Card className="mt-6">
          <div className="space-y-4">
            {['Echo-Intel deep dive request', 'EchoCheck full verification', 'Founder interview scheduling'].map((r, i) => (
              <div key={r} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-text-primary">{r}</p>
                  <p className="text-xs text-text-muted">Submitted {i + 1} week{i > 0 ? 's' : ''} ago</p>
                </div>
                <Badge variant={i === 0 ? 'primary' : 'outline'}>{i === 0 ? 'In Progress' : 'Pending'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <h3 className="font-heading text-base font-semibold text-text-primary mb-2">Onboarding Status</h3>
        <ProgressBar value={75} className="mb-2" />
        <p className="text-xs text-text-muted">3 of 4 onboarding steps completed</p>
      </Card>
    </div>
  )
}
