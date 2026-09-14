import { motion } from 'framer-motion'
import { Users, FolderOpen, BookOpen, AlertTriangle, Activity, Server } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { StatCard, ChartCard, Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { adminAnalytics } from '@/services'

export default function AdminConsolePage() {
  return (
    <div className="max-w-[1280px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Admin Console</h1>
        <p className="text-text-muted mt-1">System operations and platform management.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-8">
        <StatCard label="Total Users" value={adminAnalytics.totalUsers.toLocaleString()} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Projects" value={adminAnalytics.totalProjects} icon={<FolderOpen className="h-4 w-4" />} />
        <StatCard label="Research" value={adminAnalytics.totalResearch} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label="Active Campaigns" value={adminAnalytics.activeCampaigns} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Pending Reviews" value={adminAnalytics.pendingReviews} icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="System Health" value={`${adminAnalytics.systemHealth}%`} icon={<Server className="h-4 w-4" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <ChartCard title="User Growth" subtitle="Monthly registered users" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={adminAnalytics.userGrowth}>
              <XAxis dataKey="date" stroke="#545B69" fontSize={12} />
              <YAxis stroke="#545B69" fontSize={12} />
              <Tooltip contentStyle={{ background: '#15171C', border: '1px solid #262A33', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#6C74F1" fill="#6C74F120" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <h3 className="font-heading text-base font-semibold text-text-primary mb-4">Activity Log</h3>
          <div className="space-y-3">
            {adminAnalytics.recentActivity.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-xs text-text-primary">{a.action}</p>
                  <p className="text-xs text-text-muted">{a.user}</p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-x-auto">
        <h3 className="font-heading text-base font-semibold text-text-primary mb-4">Moderation Queue</h3>
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="pb-3 pr-4">Item</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Submitted</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { item: 'Global Mesh', type: 'Project', date: '2026-02-10', status: 'pending' },
              { item: 'Nova Compute EchoCheck', type: 'Review', date: '2026-02-08', status: 'in_review' },
              { item: 'Community Report #442', type: 'Report', date: '2026-02-07', status: 'pending' },
            ].map((row) => (
              <tr key={row.item} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 text-text-primary">{row.item}</td>
                <td className="py-3 pr-4 text-text-muted">{row.type}</td>
                <td className="py-3 pr-4 text-text-muted">{row.date}</td>
                <td className="py-3"><Badge variant={row.status === 'pending' ? 'gold' : 'secondary'}>{row.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
