import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TrendingUp, CheckCircle, Zap, Trophy } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { StatCard, ChartCard, Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar, ActivityItem, EmptyState, ErrorState, LoadingState } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { contributorAnalytics, bountyQuests } from '@/services'
import { contributors } from '@/data/contributors'
import { contributorMetrics } from '@/data/contributorMetrics'
import { getApiErrorMessage } from '@/services/apiClient'
import {
  createContribution,
  fetchMyContributorProfile,
  fetchMyContributions,
  submitContribution,
  updateContribution,
  updateMyContributorProfile,
  type Contribution,
  type ContributionInput,
  type ContributorProfile,
} from '@/services/contributorDashboardApi'

const initialProfileForm = {
  username: '',
  display_name: '',
  bio: '',
  avatar_path: '',
}

const initialContributionForm: ContributionInput = {
  title: '',
  type: 'research',
  description: '',
  evidence_url: '',
}

const initialPagination = { page: 1, per_page: 20, total: 0, total_pages: 1 }

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString()
}

function contributionStatusLabel(status: Contribution['status']) {
  return status.replaceAll('_', ' ')
}

function contributionStatusVariant(status: Contribution['status']): 'primary' | 'gold' | 'coral' | 'outline' {
  if (status === 'approved') return 'primary'
  if (status === 'rejected') return 'coral'
  if (status === 'changes_requested') return 'gold'
  return 'outline'
}

function ProfileEditor({
  profile,
  loading,
  loadError,
  saving,
  saveError,
  success,
  onRetry,
  onSave,
}: {
  profile: ContributorProfile | null
  loading: boolean
  loadError: string | null
  saving: boolean
  saveError: string | null
  success: string | null
  onRetry: () => void
  onSave: (form: typeof initialProfileForm) => Promise<void>
}) {
  const [form, setForm] = useState(initialProfileForm)

  useEffect(() => {
    if (!profile) return
    setForm({
      username: profile.username,
      display_name: profile.display_name ?? '',
      bio: profile.bio ?? '',
      avatar_path: profile.avatar_path ?? '',
    })
  }, [profile])

  function updateField(field: keyof typeof initialProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave(form)
  }

  return (
    <Card>
      <h3 className="font-heading text-base font-semibold text-text-primary">Contributor Profile</h3>
      <p className="text-xs text-text-muted mt-1">Update the public profile fields on your account.</p>
      {loading ? <LoadingState message="Loading profile..." /> : loadError ? (
        <ErrorState title="Profile unavailable" description={loadError} onRetry={onRetry} />
      ) : (
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Username" name="username" required maxLength={80} value={form.username} onChange={(event) => updateField('username', event.target.value)} />
            <Input label="Display name" name="display_name" required maxLength={160} value={form.display_name} onChange={(event) => updateField('display_name', event.target.value)} />
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
            Bio
            <textarea name="bio" maxLength={4000} rows={4} value={form.bio} onChange={(event) => updateField('bio', event.target.value)} className="w-full rounded-lg bg-canvas border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-echo-green focus:ring-1 focus:ring-echo-green/30" />
          </label>
          <Input label="Avatar path" name="avatar_path" maxLength={500} value={form.avatar_path} onChange={(event) => updateField('avatar_path', event.target.value)} />
          {saveError && <p role="alert" className="text-sm text-error">{saveError}</p>}
          {success && <p role="status" className="text-sm text-echo-green">{success}</p>}
          <Button type="submit" loading={saving} disabled={!profile}>Save profile</Button>
        </form>
      )}
    </Card>
  )
}

function ContributionEditor({
  contribution,
  saving,
  error,
  onCancel,
  onSave,
}: {
  contribution: Contribution | null
  saving: boolean
  error: string | null
  onCancel: () => void
  onSave: (input: ContributionInput, submitAfterSave: boolean) => Promise<void>
}) {
  const [form, setForm] = useState<ContributionInput>(initialContributionForm)

  useEffect(() => {
    setForm(contribution ? {
      title: contribution.title,
      type: contribution.type,
      description: contribution.description,
      evidence_url: contribution.evidence_url ?? '',
    } : initialContributionForm)
  }, [contribution])

  function updateField<K extends keyof ContributionInput>(field: K, value: ContributionInput[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>, submitAfterSave: boolean) {
    event.preventDefault()
    if (saving) return
    await onSave({ ...form, evidence_url: form.evidence_url?.trim() || null }, submitAfterSave)
  }

  return (
    <Card className="mt-5">
      <h3 className="font-heading text-base font-semibold text-text-primary">{contribution ? 'Edit contribution draft' : 'New contribution draft'}</h3>
      <form className="mt-5 space-y-4" onSubmit={(event) => submit(event, false)}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Title" name="title" required maxLength={180} value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          <Select
            label="Type"
            name="type"
            options={[
              { value: 'research', label: 'Research' },
              { value: 'review', label: 'Review' },
              { value: 'writing', label: 'Writing' },
              { value: 'design', label: 'Design' },
              { value: 'community', label: 'Community' },
              { value: 'other', label: 'Other' },
            ]}
            value={form.type}
            onChange={(event) => updateField('type', event.target.value as ContributionInput['type'])}
          />
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
          Description
          <textarea name="description" required maxLength={10000} rows={5} value={form.description} onChange={(event) => updateField('description', event.target.value)} className="w-full rounded-lg bg-canvas border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-echo-green focus:ring-1 focus:ring-echo-green/30" />
        </label>
        <Input label="Evidence URL (optional)" name="evidence_url" type="url" maxLength={2048} value={form.evidence_url ?? ''} onChange={(event) => updateField('evidence_url', event.target.value)} />
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="outline" loading={saving}>Save draft</Button>
          <Button type="button" loading={saving} onClick={(event) => {
            if (event.currentTarget.form?.reportValidity()) void onSave({ ...form, evidence_url: form.evidence_url?.trim() || null }, true)
          }}>{contribution ? 'Save and submit' : 'Create and submit'}</Button>
          <Button type="button" variant="ghost" disabled={saving} onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

export default function ContributorDashboardPage() {
  const { user } = useAuth()
  const contributor = contributors[0]
  const [profile, setProfile] = useState<ContributorProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileRetry, setProfileRetry] = useState(0)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [contributionsLoading, setContributionsLoading] = useState(true)
  const [contributionsError, setContributionsError] = useState<string | null>(null)
  const [contributionRetry, setContributionRetry] = useState(0)
  const [contributionReload, setContributionReload] = useState(0)
  const [pagination, setPagination] = useState(initialPagination)
  const [page, setPage] = useState(1)
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [contributionSaving, setContributionSaving] = useState(false)
  const [contributionError, setContributionError] = useState<string | null>(null)
  const [contributionSuccess, setContributionSuccess] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<number | string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setProfileLoading(true)
    setProfileError(null)
    fetchMyContributorProfile(controller.signal)
      .then((result) => {
        setProfile(result)
        setProfileSaveError(null)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setProfileError(getApiErrorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileLoading(false)
      })
    return () => controller.abort()
  }, [profileRetry])

  useEffect(() => {
    const controller = new AbortController()
    setContributionsLoading(true)
    setContributionsError(null)
    fetchMyContributions(page, controller.signal)
      .then((result) => {
        setContributions(result.contributions)
        setPagination(result.pagination)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setContributionsError(getApiErrorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setContributionsLoading(false)
      })
    return () => controller.abort()
  }, [page, contributionRetry, contributionReload])

  async function saveProfile(form: { username: string; display_name: string; bio: string; avatar_path: string }) {
    if (profileSaving) return
    setProfileSaving(true)
    setProfileSaveError(null)
    setProfileSuccess(null)
    try {
      const updated = await updateMyContributorProfile({
        username: form.username.trim(),
        display_name: form.display_name.trim(),
        bio: form.bio.trim() || null,
        avatar_path: form.avatar_path.trim() || null,
      })
      setProfile(updated)
      setProfileSuccess('Profile updated successfully.')
    } catch (error: unknown) {
      setProfileSaveError(getApiErrorMessage(error))
    } finally {
      setProfileSaving(false)
    }
  }

  async function saveContribution(input: ContributionInput, submitAfterSave: boolean) {
    if (contributionSaving) return
    setContributionSaving(true)
    setContributionError(null)
    setContributionSuccess(null)
    let savedDraft = false
    try {
      let contribution = editingContribution
        ? await updateContribution(editingContribution.id, input)
        : await createContribution(input)
      savedDraft = true

      if (submitAfterSave) contribution = await submitContribution(contribution.id)

      setContributionSuccess(submitAfterSave ? 'Contribution submitted for review.' : 'Draft saved successfully.')
      setEditingContribution(null)
      setEditorOpen(false)
      setPage(1)
    } catch (error: unknown) {
      setContributionError(getApiErrorMessage(error))
    } finally {
      setContributionSaving(false)
      if (savedDraft) setContributionReload((current) => current + 1)
    }
  }

  async function submitExistingContribution(contribution: Contribution) {
    if (submittingId !== null || contributionSaving) return
    setSubmittingId(contribution.id)
    setContributionError(null)
    setContributionSuccess(null)
    try {
      await submitContribution(contribution.id)
      setContributionSuccess('Contribution submitted for review.')
      setContributionReload((current) => current + 1)
    } catch (error: unknown) {
      setContributionError(getApiErrorMessage(error))
    } finally {
      setSubmittingId(null)
    }
  }

  function startNewContribution() {
    setEditingContribution(null)
    setContributionError(null)
    setContributionSuccess(null)
    setEditorOpen(true)
  }

  function startEditingContribution(contribution: Contribution) {
    setEditingContribution(contribution)
    setContributionError(null)
    setContributionSuccess(null)
    setEditorOpen(true)
  }

  return (
    <div className="max-w-[1280px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Contributor Dashboard</h1>
        <p className="text-text-muted mt-1">Welcome back, {user?.name ?? 'Contributor'}</p>
      </motion.div>

      <p className="text-xs text-text-muted mt-7">Sample dashboard metrics and rewards preview</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
        <StatCard label={contributorMetrics.reputation.label} value={user?.reputation ?? contributor.reputation} change="+8.2%" icon={<Trophy className="h-4 w-4" />} />
        <StatCard label="Tasks Completed" value="47" change="+3" icon={<CheckCircle className="h-4 w-4" />} />
        <StatCard label="Recent Impact" value="1,240" change="+12%" icon={<Zap className="h-4 w-4" />} />
        <StatCard label={contributorMetrics.echoPoints.label} value={(user?.echoPoints ?? contributor.echoPoints).toLocaleString()} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <ChartCard title="Sample Rewards Analytics" subtitle="Preview: EchoPoints earned over time">
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

        <ChartCard title="Sample Contribution Breakdown" subtitle="Preview: by category">
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
          <h3 className="font-heading text-base font-semibold text-text-primary mb-4">Sample Bounty Quests</h3>
          <div className="space-y-4">
            {bountyQuests.map((q) => (
              <div key={q.id} className="flex flex-col gap-4 p-4 rounded-lg bg-raised border border-border sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{q.title}</p>
                  <p className="text-xs text-text-muted mt-1">{q.description}</p>
                  <div className="flex gap-2 mt-2"><Badge variant="gold">{q.points} pts</Badge><Badge variant="outline">{q.difficulty}</Badge></div>
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
          <h3 className="font-heading text-base font-semibold text-text-primary mb-4">Sample Leaderboard and Activity</h3>
          <div className="text-center py-4">
            <span className="font-heading text-4xl font-bold text-accent-gold">#{contributor.leaderboardRank}</span>
            <p className="text-sm text-text-muted mt-2">Preview rank</p>
            <Link to="/leaderboards" className="inline-block text-sm text-echo-green hover:underline mt-3">View Leaderboards</Link>
          </div>
          <div className="mt-4 space-y-1">
            <ActivityItem title="Sample EchoCheck review approved" subtitle="Vertex Vaults" time="2h ago" />
            <ActivityItem title="Sample research published" subtitle="Aether Echo-Intel" time="1d ago" />
            <ActivityItem title="Sample bounty completed" subtitle="Community translation" time="3d ago" />
          </div>
        </Card>
      </div>

      <div className="grid xl:grid-cols-2 gap-6 mt-6">
        <ProfileEditor
          profile={profile}
          loading={profileLoading}
          loadError={profileError}
          saving={profileSaving}
          saveError={profileSaveError}
          success={profileSuccess}
          onRetry={() => setProfileRetry((current) => current + 1)}
          onSave={saveProfile}
        />

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-base font-semibold text-text-primary">My Contributions</h3>
              <p className="text-xs text-text-muted mt-1">Your submissions, statuses, and reviewer feedback.</p>
            </div>
            <Button size="sm" onClick={startNewContribution} disabled={contributionSaving || submittingId !== null}>New contribution</Button>
          </div>

          {contributionSuccess && <p role="status" className="text-sm text-echo-green mt-4">{contributionSuccess}</p>}
          {contributionError && !editorOpen && <p role="alert" className="text-sm text-error mt-4">{contributionError}</p>}

          <div className="mt-4">
            {contributionsLoading ? <LoadingState message="Loading contributions..." /> : contributionsError ? (
              <ErrorState title="Contributions unavailable" description={contributionsError} onRetry={() => setContributionRetry((current) => current + 1)} />
            ) : contributions.length === 0 ? (
              <EmptyState title="No contributions yet" description="Create a draft contribution to get started." action={<Button variant="outline" size="sm" onClick={startNewContribution}>Create a draft</Button>} />
            ) : (
              <div className="space-y-3">
                {contributions.map((contribution) => {
                  const canEdit = contribution.status === 'draft' || contribution.status === 'changes_requested'
                  const submittedDate = formatDate(contribution.submitted_at)
                  return (
                    <div key={contribution.id} className="rounded-lg bg-raised border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary">{contribution.title}</p>
                          <p className="text-xs text-text-muted mt-1">{contribution.type}{submittedDate ? ` · Submitted ${submittedDate}` : ''}</p>
                        </div>
                        <Badge variant={contributionStatusVariant(contribution.status)}>{contributionStatusLabel(contribution.status)}</Badge>
                      </div>
                      <p className="text-sm text-text-secondary mt-3 whitespace-pre-wrap">{contribution.description}</p>
                      {contribution.evidence_url && <a href={contribution.evidence_url} target="_blank" rel="noreferrer" className="inline-block text-xs text-echo-green hover:underline mt-2">View evidence</a>}
                      {contribution.review_note && <div className="mt-3 p-3 rounded-md border border-accent-gold/30 bg-accent-gold/5"><p className="text-xs font-medium text-accent-gold">Reviewer feedback</p><p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{contribution.review_note}</p></div>}
                      {canEdit && <div className="flex flex-wrap gap-2 mt-4"><Button size="sm" variant="outline" disabled={contributionSaving || submittingId !== null} onClick={() => startEditingContribution(contribution)}>Edit draft</Button><Button size="sm" disabled={contributionSaving || submittingId !== null} loading={submittingId === contribution.id} onClick={() => void submitExistingContribution(contribution)}>Submit for review</Button></div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {!contributionsLoading && !contributionsError && pagination.total_pages > 1 && <div className="mt-5 flex items-center justify-center gap-3"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="text-xs text-text-muted">Page {pagination.page} of {pagination.total_pages}</span><Button size="sm" variant="outline" disabled={page >= pagination.total_pages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
        </Card>
      </div>

      {editorOpen && (
        <ContributionEditor
          key={editingContribution?.id ?? 'new'}
          contribution={editingContribution}
          saving={contributionSaving}
          error={contributionError}
          onCancel={() => { setEditorOpen(false); setEditingContribution(null); setContributionError(null) }}
          onSave={saveContribution}
        />
      )}
    </div>
  )
}
