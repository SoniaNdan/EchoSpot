import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bell, ChevronLeft, ChevronRight, Settings, ShieldCheck, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Input, PasswordInput, SearchInput, Select, Switch } from '@/components/ui/Input'
import { ProgressBar, EmptyState, ErrorState, LoadingState } from '@/components/ui/Progress'
import { ContributorCard, LeaderboardRow, Podium } from '@/components/contributors/ContributorCard'
import { leaderboardCategories, leaderboards } from '@/data/contributors'
import { getContributorById } from '@/data/contributors'
import { getProjectBySlug } from '@/data/projects'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { fetchContributorDirectory, fetchContributorProfile, fetchContributorSkills, type ContributorDirectoryPage, type ContributorSkill, type PublicContributor } from '@/services/contributorApi'
import { getApiErrorStatus } from '@/services/researchApi'
import { getApiErrorMessage } from '@/services/apiClient'

export function SimplePage({ title, description, action, href }: { title: string; description: string; action: string; href: string }) {
  return <div className="max-w-[720px] mx-auto px-4 py-24 text-center"><h1 className="font-heading text-3xl font-semibold text-text-primary">{title}</h1><p className="text-text-muted mt-3">{description}</p><Link to={href} className="inline-block mt-6"><Button>{action}</Button></Link></div>
}

export function AboutPage() {
  return <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-16"><Badge variant="primary">Our approach</Badge><h1 className="font-heading text-4xl font-semibold text-text-primary mt-4">Making Web3 legible.</h1><p className="text-lg text-text-muted mt-5 max-w-2xl">EchoSpot is research infrastructure for people who need evidence before they make sense of an ecosystem.</p><div className="grid md:grid-cols-3 gap-5 mt-12">{[['Signal over spectacle','Clear, sourced research without the hype cycle.'],['Evidence first','Verification states, contributors, and sources stay visible.'],['Depth on demand','Start with a calm summary, then investigate the details.']].map(([title, body]) => <Card key={title}><h2 className="font-heading text-lg text-text-primary">{title}</h2><p className="text-sm text-text-muted mt-2">{body}</p></Card>)}</div></div>
}

export function ContributorsPage() {
  const [query, setQuery] = useState('')
  const [skill, setSkill] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<ContributorDirectoryPage>({ contributors: [], pagination: { page: 1, per_page: 20, total: 0, total_pages: 1 } })
  const [skills, setSkills] = useState<ContributorSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skillsError, setSkillsError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchContributorSkills(controller.signal)
      .then((items) => { setSkills(items); setSkillsError(null) })
      .catch(() => { if (!controller.signal.aborted) setSkillsError('Contributor skills could not be loaded.') })
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetchContributorDirectory({ search: query, skill, page }, controller.signal)
      .then(setResult)
      .catch(() => { if (!controller.signal.aborted) setError('Contributors could not be loaded. Check your connection and try again.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, skill, page, retry])

  function clearFilters() {
    setQuery('')
    setSkill('')
    setPage(1)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-heading text-3xl font-semibold text-text-primary">Contributors</h1><p className="text-text-muted mt-2">The researchers and builders strengthening EchoSpot's public record.</p></div>
        <Link to="/leaderboards" className="text-sm text-echo-green hover:underline">View Leaderboards</Link>
      </div>
      <div className="mt-7 grid sm:grid-cols-[minmax(0,1fr)_16rem] gap-3 max-w-3xl">
        <SearchInput aria-label="Search contributors" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search contributors..." />
        <Select aria-label="Filter by skill" options={[{ value: '', label: 'All skills' }, ...skills.map(({ slug, name }) => ({ value: slug, label: name }))]} value={skill} onChange={(event) => { setSkill(event.target.value); setPage(1) }} />
      </div>
      {skillsError && <div className="mt-3 flex items-center gap-3 text-sm text-error" role="alert"><span>{skillsError}</span><Button variant="outline" size="sm" onClick={() => setRetry((current) => current + 1)}>Try again</Button></div>}
      <div className="mt-8">
        {loading ? <LoadingState message="Loading contributors..." /> : error ? (
          <ErrorState title="Contributors unavailable" description={error} onRetry={() => setRetry((current) => current + 1)} />
        ) : result.contributors.length === 0 ? (
          <EmptyState title="No contributors found" description="Try a different name or skill." action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{result.contributors.map((contributor) => <ContributorCard key={contributor.username} contributor={contributor} />)}</div>
            {result.pagination.total_pages > 1 && <div className="mt-8 flex items-center justify-center gap-4"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="text-sm text-text-muted">Page {result.pagination.page} of {result.pagination.total_pages}</span><Button variant="outline" size="sm" disabled={page >= result.pagination.total_pages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
          </>
        )}
      </div>
    </div>
  )
}

export function ContributorProfilePage() {
  const { id = '' } = useParams()
  const username = id
  const [contributor, setContributor] = useState<PublicContributor | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setNotFound(false)
    fetchContributorProfile(username, controller.signal)
      .then(setContributor)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        setContributor(null)
        if (getApiErrorStatus(requestError) === 404) setNotFound(true)
        else setError('This contributor profile could not be loaded. Check your connection and try again.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [username, retry])

  if (loading) return <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8"><LoadingState message="Loading contributor profile..." /></div>
  if (notFound) return <SimplePage title="Contributor not found" description="This contributor profile is unavailable." action="View contributors" href="/contributors" />
  if (error || !contributor) return <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8"><ErrorState title="Profile unavailable" description={error ?? 'This contributor profile could not be loaded.'} onRetry={() => setRetry((current) => current + 1)} /></div>

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8">
      <Link to="/contributors" className="inline-flex text-sm text-text-muted hover:text-echo-green"><ChevronLeft className="h-4 w-4" /> Contributors</Link>
      <Card className="mt-5">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <img src={contributor.avatar || undefined} alt="" className="h-24 w-24 rounded-full bg-raised" />
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center"><h1 className="font-heading text-3xl text-text-primary">{contributor.name}</h1>{contributor.roles.map((role) => <Badge key={role} variant="gold">{role}</Badge>)}</div>
            <p className="text-text-muted">@{contributor.username}</p><p className="text-sm text-text-secondary mt-3">{contributor.bio}</p>
          </div>
          <Button variant="outline">Follow</Button>
        </div>
        {contributor.skills.length > 0 && <div className="flex flex-wrap gap-2 border-t border-border mt-6 pt-6">{contributor.skills.map((item) => <Badge key={item.slug} variant="outline">{item.name}</Badge>)}</div>}
      </Card>
      <section className="mt-8">
        <h2 className="font-heading text-xl text-text-primary mb-4">Recent contributions</h2>
        {contributor.contributions.length === 0 ? <EmptyState title="No public contributions yet" description="Approved contributions will appear here." /> : (
          <Card padding="none">
            {contributor.contributions.map((item) => <div key={item.id} className="px-5 py-4 border-b border-border last:border-0 flex justify-between gap-3"><div><p className="text-sm text-text-primary">{item.title}</p><p className="text-xs text-text-muted mt-1">{item.type}{item.date ? ' · ' + new Date(item.date).toLocaleDateString() : ''}</p>{item.description && <p className="text-sm text-text-secondary mt-2">{item.description}</p>}</div><Badge variant="primary">{item.type}</Badge></div>)}
          </Card>
        )}
      </section>
    </div>
  )
}

export function LeaderboardsPage() {
  const [category, setCategory] = useState<(typeof leaderboardCategories)[number]['id']>('contributors')
  const entries = leaderboards[category] ?? leaderboards.contributors
  return <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8"><div className="flex items-center gap-3"><Trophy className="h-8 w-8 text-accent-gold" /><div><h1 className="font-heading text-3xl text-text-primary">Leaderboards</h1><p className="text-text-muted mt-1">A transparent record of work and impact across the ecosystem.</p></div></div><div className="flex flex-wrap gap-2 mt-7">{leaderboardCategories.map((item) => <Button key={item.id} size="sm" variant={category === item.id ? 'primary' : 'outline'} onClick={() => setCategory(item.id)}>{item.label}</Button>)}</div><Podium entries={entries.slice(0, 3).map((item) => ({ rank: item.rank, name: item.name, avatar: item.avatar, score: item.reputation, profileId: getContributorById(item.contributorId)?.id }))} /><Card padding="none" className="mt-7">{entries.map((item) => <LeaderboardRow key={item.contributorId} {...item} profileId={getContributorById(item.contributorId)?.id} />)}</Card></div>
}

export function FounderApplicationPage() {
  type ApplicationField = {
    name: string
    label: string
    placeholder?: string
    type?: 'text' | 'url'
    required?: boolean
    options?: readonly { value: string; label: string }[]
  }

  const chainOptions = [
    { value: 'Ethereum', label: 'Ethereum' },
    { value: 'Arbitrum', label: 'Arbitrum' },
    { value: 'Solana', label: 'Solana' },
    { value: 'Polygon', label: 'Polygon' },
    { value: 'Multi-chain', label: 'Multi-chain' },
  ] as const

  const stageOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'mvp', label: 'MVP' },
    { value: 'testnet', label: 'Testnet' },
    { value: 'mainnet', label: 'Mainnet' },
    { value: 'scaling', label: 'Scaling' },
  ] as const

  const categoryOptions = [
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'DeFi', label: 'DeFi' },
    { value: 'Security', label: 'Security' },
    { value: 'Oracle', label: 'Oracle' },
    { value: 'DePIN', label: 'DePIN' },
  ] as const

  const supportOptions = [
    {
      value: 'research',
      label: 'Independent research / Echo-Intel',
      description: 'Request an independent research review of the project.',
    },
    {
      value: 'echocheck',
      label: 'EchoCheck assessment',
      description: 'Request evidence-led verification using EchoSpot criteria.',
    },
    {
      value: 'visibility',
      label: 'Visibility / distribution campaign',
      description: 'Explore promotional distribution and visibility support.',
    },
    {
      value: 'interview',
      label: 'Founder interview',
      description: 'Request consideration for a founder interview.',
    },
    {
      value: 'other',
      label: 'Other',
      description: 'Tell us about another kind of support you need.',
    },
  ] as const

  const steps: Array<{ title: string; fields: ApplicationField[] }> = [
    {
      title: 'Project Overview',
      fields: [
        { name: 'projectName', label: 'Project name', placeholder: 'Aether Protocol', required: true },
        { name: 'tagline', label: 'One-sentence description', placeholder: 'Explain the project clearly', required: true },
        { name: 'chain', label: 'Primary chain', required: true, options: chainOptions },
      ],
    },
    {
      title: 'Team',
      fields: [
        { name: 'teamLead', label: 'Primary contact', placeholder: 'Name and role', required: true },
        { name: 'teamBackground', label: 'Team background', placeholder: 'Relevant experience and expertise' },
        { name: 'teamLocation', label: 'Team location', placeholder: 'Remote, Lagos, London...' },
      ],
    },
    {
      title: 'Website & Socials',
      fields: [
        { name: 'website', label: 'Website', placeholder: 'https://example.com', type: 'url' },
        { name: 'social', label: 'Primary social channel', placeholder: 'https://x.com/yourproject', type: 'url' },
        { name: 'community', label: 'Community link', placeholder: 'https://discord.gg/yourproject', type: 'url' },
      ],
    },
    {
      title: 'Whitepaper',
      fields: [
        { name: 'whitepaper', label: 'Whitepaper or documentation URL', placeholder: 'https://docs.example.com', type: 'url' },
        { name: 'repository', label: 'Repository URL', placeholder: 'https://github.com/yourproject', type: 'url' },
        { name: 'technicalSummary', label: 'Technical summary', placeholder: 'Describe the core architecture' },
      ],
    },
    {
      title: 'Product Demo',
      fields: [
        { name: 'productStage', label: 'Current product stage', required: true, options: stageOptions },
        { name: 'demo', label: 'Demo URL', placeholder: 'https://app.example.com', type: 'url' },
        { name: 'usage', label: 'Current usage or traction', placeholder: 'Share meaningful metrics or milestones' },
      ],
    },
    {
      title: 'Ecosystem',
      fields: [
        { name: 'category', label: 'Project category', required: true, options: categoryOptions },
        { name: 'ecosystem', label: 'Relevant ecosystems', placeholder: 'Ethereum, Arbitrum, Solana...' },
      ],
    },
    { title: 'Review & Submit', fields: [] },
  ]

  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [supportRequests, setSupportRequests] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const currentStep = steps[step]

  function isValidUrl(value: string) {
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {}

    currentStep.fields.forEach((field) => {
      const value = (values[field.name] ?? '').trim()

      if (field.required && !value) {
        nextErrors[field.name] = field.label + ' is required.'
        return
      }

      if (field.type === 'url' && value && !isValidUrl(value)) {
        nextErrors[field.name] = 'Enter a valid URL beginning with http:// or https://.'
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function updateValue(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }))

    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  function toggleSupport(value: string) {
    setSupportRequests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (step === steps.length - 1) {
      setSubmitted(true)
      return
    }

    if (!validateCurrentStep()) return

    setStep((value) => value + 1)
  }

  function goToStep(nextStep: number) {
    setErrors({})
    setStep(nextStep)
  }

  function displayValue(field: ApplicationField) {
    const value = (values[field.name] ?? '').trim()

    if (!value) return 'Not provided'

    if (field.options) {
      return field.options.find((option) => option.value === value)?.label ?? value
    }

    return value
  }

  const requestedSupportLabels = supportOptions
    .filter((option) => supportRequests.includes(option.value))
    .map((option) => option.label)

  const visibilityRequested = supportRequests.includes('visibility')

  if (submitted) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-20">
        <Card className="text-center">
          <ShieldCheck className="h-10 w-10 text-echo-green mx-auto" />
          <h1 className="font-heading text-2xl text-text-primary mt-4">Application saved locally</h1>
          <p className="text-text-muted mt-2">
            This frontend prototype recorded the submission only in the current browser session.
            No application data was transmitted to EchoSpot.
          </p>
          <Link to="/founder" className="inline-block mt-6">
            <Button>Open founder console</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-3xl text-text-primary">Submit a project</h1>
      <p className="text-text-muted mt-2">
        Provide the information researchers need to begin an evidence-led review.
      </p>

      <div className="mt-8">
        <div className="flex justify-between text-xs text-text-muted mb-2">
          <span>Step {step + 1} of {steps.length}</span>
          <span>{currentStep.title}</span>
        </div>
        <ProgressBar value={((step + 1) / steps.length) * 100} />
      </div>

      <Card className="mt-6">
        <form onSubmit={submit} noValidate>
          <h2 className="font-heading text-xl text-text-primary">{currentStep.title}</h2>
          <p className="text-sm text-text-muted mt-2">
            All information stays in this browser session. No data is sent.
          </p>

          {currentStep.fields.length > 0 && (
            <div className="space-y-4 mt-6">
              {currentStep.fields.map((field) => (
                <div key={field.name}>
                  {field.options ? (
                    <label className="block">
                      <span className="block text-sm text-text-secondary mb-2">
                        {field.label}
                        {field.required && <span className="text-error ml-1">*</span>}
                      </span>

                      <select
                        name={field.name}
                        value={values[field.name] ?? ''}
                        onChange={(event) => updateValue(field.name, event.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-echo-green"
                        style={{ colorScheme: 'dark' }}
                        aria-invalid={Boolean(errors[field.name])}
                      >
                        <option
                          value=""
                          style={{ backgroundColor: '#15171C', color: '#F3F4F6' }}
                        >
                          Select {field.label.toLowerCase()}
                        </option>
                        {field.options.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            style={{ backgroundColor: '#15171C', color: '#F3F4F6' }}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Input
                      name={field.name}
                      label={field.label}
                      type={field.type ?? 'text'}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ''}
                      onChange={(event) => updateValue(field.name, event.target.value)}
                    />
                  )}

                  {errors[field.name] && (
                    <p className="text-xs text-error mt-1.5">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              {step === 5 && (
                <div className="pt-2">
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">Support requested</h3>
                    <p className="text-xs text-text-muted mt-1">
                      Select any EchoSpot services or support areas you want to explore.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    {supportOptions.map((option) => {
                      const selected = supportRequests.includes(option.value)

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleSupport(option.value)}
                          className={
                            'text-left rounded-lg border p-4 transition-colors ' +
                            (selected
                              ? 'border-echo-green bg-echo-green/10'
                              : 'border-border bg-raised hover:border-text-muted')
                          }
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-text-primary">
                              {option.label}
                            </span>
                            <span
                              className={
                                'h-4 w-4 rounded border flex items-center justify-center text-[10px] ' +
                                (selected
                                  ? 'border-echo-green bg-echo-green text-background'
                                  : 'border-border')
                              }
                            >
                              {selected ? 'âœ“' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-2">{option.description}</p>
                        </button>
                      )
                    })}
                  </div>

                  {supportRequests.includes('other') && (
                    <div className="mt-4">
                      <Input
                        name="supportOther"
                        label="Other support notes"
                        placeholder="Tell us what kind of support you need"
                        value={values.supportOther ?? ''}
                        onChange={(event) => updateValue('supportOther', event.target.value)}
                      />
                    </div>
                  )}

                  <div className="rounded-lg border border-echo-green/30 bg-echo-green/5 p-4 mt-5">
                    <p className="text-sm font-medium text-text-primary">Research independence</p>
                    <p className="text-xs leading-5 text-text-muted mt-1">
                      Visibility and research are separate at EchoSpot. Purchasing or requesting
                      visibility does not influence research findings or EchoCheck outcomes.
                      Commercial relationships may be disclosed on published research and
                      verification reports.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === steps.length - 1 && (
            <div className="space-y-4 mt-6">
              {steps.slice(0, -1).map((reviewStep, reviewStepIndex) => (
                <div key={reviewStep.title} className="rounded-lg bg-raised border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-text-primary">{reviewStep.title}</h3>
                    <button
                      type="button"
                      onClick={() => goToStep(reviewStepIndex)}
                      className="text-xs text-echo-green hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <dl className="space-y-3 mt-4">
                    {reviewStep.fields.map((field) => (
                      <div
                        key={field.name}
                        className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4"
                      >
                        <dt className="text-xs text-text-muted">{field.label}</dt>
                        <dd className="text-sm text-text-secondary break-words">
                          {displayValue(field)}
                        </dd>
                      </div>
                    ))}

                    {reviewStepIndex === 5 && (
                      <>
                        <div className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
                          <dt className="text-xs text-text-muted">Support requested</dt>
                          <dd className="text-sm text-text-secondary">
                            {requestedSupportLabels.length
                              ? requestedSupportLabels.join(', ')
                              : 'None selected'}
                          </dd>
                        </div>

                        {supportRequests.includes('other') && values.supportOther && (
                          <div className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
                            <dt className="text-xs text-text-muted">Other support notes</dt>
                            <dd className="text-sm text-text-secondary break-words">
                              {values.supportOther}
                            </dd>
                          </div>
                        )}

                        <div className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
                          <dt className="text-xs text-text-muted">
                            Visibility relationship/request
                          </dt>
                          <dd className="text-sm text-text-secondary">
                            {visibilityRequested ? 'Visibility support requested' : 'Not requested'}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              ))}

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-text-primary">Before submitting</p>
                <p className="text-xs leading-5 text-text-muted mt-1">
                  Submitting a project or requesting visibility does not guarantee publication,
                  verification, a particular EchoCheck score, or a positive research outcome.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 mt-8">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0}
              onClick={() => goToStep(step - 1)}
            >
              Back
            </Button>

            <Button type="submit">
              {step === steps.length - 1 ? (
                'Submit application'
              ) : (
                <>
                  Continue <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export function AuthPage({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resetRequested, setResetRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const title = mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : 'Reset your password'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mode === 'forgot') {
      setResetRequested(true)
      return
    }

    setLoading(true)
    setError(null)
    const form = new FormData(event.currentTarget)

    try {
      if (mode === 'login') {
        await login(String(form.get('email')), String(form.get('password')))
      } else {
        await register(
          String(form.get('email')),
          String(form.get('password')),
          String(form.get('name')),
          String(form.get('password_confirmation')),
        )
      }
      navigate('/dashboard')
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  if (resetRequested) return <div role="status"><ShieldCheck className="h-10 w-10 text-echo-green" /><h1 className="font-heading text-3xl text-text-primary mt-4">Check your inbox</h1><p className="text-text-muted mt-2">If this were a connected account, reset instructions would be sent to the email you entered.</p><Button className="mt-6" onClick={() => navigate('/login')}>Back to sign in</Button></div>

  return (
    <form onSubmit={submit}>
      <h1 className="font-heading text-3xl text-text-primary">{title}</h1>
      <p className="text-text-muted mt-2">{mode === 'forgot' ? 'We?ll send reset instructions to your email.' : 'Continue your evidence-led Web3 work.'}</p>
      <div className="space-y-4 mt-8">
        {mode === 'register' && <Input required name="name" label="Full name" autoComplete="name" placeholder="Sarah Mitchell" />}
        <Input required name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
        {mode !== 'forgot' && <PasswordInput required name="password" label="Password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder="????????" />}
        {mode === 'register' && <PasswordInput required name="password_confirmation" label="Confirm password" autoComplete="new-password" placeholder="????????" />}
      </div>
      {error && <p role="alert" className="text-sm text-error mt-4">{error}</p>}
      <Button type="submit" className="w-full mt-6" loading={loading}>{mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset instructions'}</Button>
      {mode === 'login' && <Link to="/forgot-password" className="block text-center text-sm text-echo-green mt-4">Forgot password?</Link>}
      <p className="text-center text-sm text-text-muted mt-6">{mode === 'login' ? <>New to EchoSpot? <Link to="/register" className="text-echo-green">Create an account</Link></> : <Link to="/login" className="text-echo-green">Back to sign in</Link>}</p>
    </form>
  )
}

export function SettingsPage() {
  const [emailUpdates, setEmailUpdates] = useState(true); const [security, setSecurity] = useState(true)
  return <div className="max-w-[860px] mx-auto"><div className="flex gap-3"><Settings className="h-8 w-8 text-echo-green" /><div><h1 className="font-heading text-2xl text-text-primary">Account settings</h1><p className="text-text-muted mt-1">Manage your profile, preferences, and mock connection settings.</p></div></div><div className="space-y-5 mt-8"><Card><h2 className="font-heading text-lg text-text-primary">Profile</h2><div className="grid sm:grid-cols-2 gap-4 mt-5"><Input label="Display name" defaultValue="Sarah Mitchell" /><Input label="Username" defaultValue="sarahm" /></div></Card><Card><h2 className="font-heading text-lg text-text-primary">Connected wallet</h2><p className="font-mono text-sm text-text-muted mt-3">0x742d...0bEb</p><Button variant="outline" size="sm" className="mt-4" disabled title="Wallet management is available when a wallet integration is connected">Wallet management unavailable</Button></Card><Card><h2 className="font-heading text-lg text-text-primary">Notifications</h2><div className="space-y-4 mt-5"><Switch id="research-updates" label="Research and project updates" checked={emailUpdates} onChange={setEmailUpdates} /><Switch id="security-updates" label="Security notifications" checked={security} onChange={setSecurity} /></div></Card><Card className="border-error/40"><h2 className="font-heading text-lg text-error">Danger zone</h2><p className="text-sm text-text-muted mt-2">Destructive actions are unavailable in this UI prototype.</p></Card></div></div>
}

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <SimplePage
        title="Profile unavailable"
        description="Sign in to view your account profile."
        action="Sign in"
        href="/login"
      />
    )
  }

  if (user.role === 'contributor' || user.role === 'researcher') {
    const contributor = getContributorById(user.id)

    if (!contributor) {
      return (
        <div className="max-w-[960px] mx-auto">
          <Card>
            <div className="flex gap-4 items-center">
              <img
                src={user.avatar}
                alt=""
                className="h-20 w-20 rounded-full bg-raised"
              />

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl text-text-primary">
                    {user.name}
                  </h1>

                  <Badge variant="gold">
                    {user.role === 'researcher' ? 'Researcher' : 'Contributor'}
                  </Badge>
                </div>

                <p className="text-text-muted">@{user.username}</p>
                <p className="text-sm text-text-muted mt-2">{user.email}</p>
              </div>
            </div>
          </Card>

          <Card className="mt-5">
            <p className="text-sm text-text-muted">
              This account is signed in correctly, but no matching public contributor
              record is available yet.
            </p>
          </Card>
        </div>
      )
    }

    return (
      <div className="max-w-[960px] mx-auto">
        <Card>
          <div className="flex gap-4 items-center">
            <img
              src={contributor.avatar}
              alt=""
              className="h-20 w-20 rounded-full"
            />

            <div>
              <h1 className="font-heading text-2xl text-text-primary">
                {contributor.name}
              </h1>

              <p className="text-text-muted">
                @{contributor.username} · {contributor.role}
              </p>

              <p className="text-sm text-text-muted mt-2">
                {contributor.bio}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4 mt-5">
          <StatCard
            label="Reputation"
            value={contributor.reputation.toLocaleString()}
          />

          <StatCard
            label="Contributions"
            value={contributor.contributions.length}
          />

          <StatCard
            label="Projects followed"
            value="14"
          />
        </div>
      </div>
    )
  }

  if (user.role === 'founder') {
    const project = getProjectBySlug('aether-protocol')

    return (
      <div className="max-w-[960px] mx-auto">
        <Card>
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
            <img
              src={user.avatar}
              alt=""
              className="h-20 w-20 rounded-full bg-raised"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl text-text-primary">
                  {user.name}
                </h1>

                <Badge variant="gold">Founder</Badge>
              </div>

              <p className="text-text-muted">@{user.username}</p>
              <p className="text-sm text-text-muted mt-2">{user.email}</p>
            </div>

            <Link to="/founder">
              <Button variant="outline">Open founder console</Button>
            </Link>
          </div>
        </Card>

        {project && (
          <Card className="mt-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={project.logo}
                  alt=""
                  className="h-14 w-14 rounded-xl bg-raised object-cover"
                />

                <div>
                  <p className="text-xs uppercase tracking-wide text-text-muted">
                    Managed project
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <h2 className="font-heading text-lg font-semibold text-text-primary">
                      {project.name}
                    </h2>

                    <StatusBadge status={project.verificationStatus} />
                  </div>

                  <p className="text-sm text-text-muted mt-1">
                    {project.category} · {project.chain} · {project.stage}
                  </p>
                </div>
              </div>

              <Link
                to={`/projects/${project.slug}`}
                className="text-sm text-echo-green hover:underline"
              >
                View public project
              </Link>
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-[960px] mx-auto">
      <Card>
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <img
            src={user.avatar}
            alt=""
            className="h-20 w-20 rounded-full bg-raised"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl text-text-primary">
                {user.name}
              </h1>

              <Badge variant="primary">Admin</Badge>
            </div>

            <p className="text-text-muted">@{user.username}</p>
            <p className="text-sm text-text-muted mt-2">{user.email}</p>
          </div>

          <Link to="/admin">
            <Button variant="outline">Open admin console</Button>
          </Link>
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Administrative account
        </h2>

        <p className="text-sm text-text-muted mt-2">
          This prototype account has access to EchoSpot's administrative workspace.
          Contributor reputation, EchoPoints, and founder project metrics are not
          applied to this account.
        </p>
      </Card>
    </div>
  )
}
export function NotificationsPage() { const { notifications, markAllNotificationsRead, markNotificationRead } = useUI(); const navigate = useNavigate(); return <div className="max-w-[820px] mx-auto"><div className="flex justify-between gap-4 items-center"><div><h1 className="font-heading text-2xl text-text-primary">Notifications</h1><p className="text-text-muted mt-1">Recent platform activity and research updates.</p></div><Button variant="outline" size="sm" onClick={markAllNotificationsRead}>Mark all read</Button></div><Card padding="none" className="mt-7">{notifications.map((notice) => <button key={notice.id} onClick={() => { markNotificationRead(notice.id); if (notice.link) navigate(notice.link) }} className="w-full text-left px-5 py-4 border-b border-border last:border-0 hover:bg-raised transition-colors"><div className="flex gap-3"><Bell className={`h-5 w-5 shrink-0 ${notice.read ? 'text-text-muted' : 'text-echo-green'}`} /><div className="flex-1"><p className="text-sm text-text-primary">{notice.title}</p><p className="text-sm text-text-muted mt-1">{notice.message}</p><p className="text-xs text-text-muted mt-2">{notice.timestamp}</p></div>{!notice.read && <span className="h-2 w-2 rounded-full bg-echo-green" />}</div></button>)}</Card></div> }




