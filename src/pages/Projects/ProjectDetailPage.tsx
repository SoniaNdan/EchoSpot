import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Code2, Globe, MessageCircle, AtSign, UserPlus } from 'lucide-react'
import { getProjectBySlug, projects } from '@/data/projects'
import { researchArticles } from '@/data/research'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge, StatusBadge, ScoreBadge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { Breadcrumbs } from '@/components/ui/Tabs'
import { ScoreRing } from '@/components/ui/Progress'
import { Timeline } from '@/components/ui/Progress'
import { EchoScoreBreakdown } from '@/components/echocheck/EchoCheckComponents'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ResearchCardCompact } from '@/components/research/ResearchCard'
import { useUI } from '@/contexts/UIContext'
import { echoScoreDimensions } from '@/lib/echoScore'
import { formatDate, formatNumber } from '@/lib/utils'

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = getProjectBySlug(slug ?? '')
  const [activeTab, setActiveTab] = useState('overview')
  const { followedProjects, toggleFollow } = useUI()

  if (!project) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-text-primary">Project not found</h1>
        <Link to="/discover" className="text-echo-green mt-4 inline-block">Back to Discover</Link>
      </div>
    )
  }

  const relatedProjects = projects.filter((p) => project.relatedProjectIds?.includes(p.id))
  const projectResearch = researchArticles.filter((a) => a.projectId === project.id)
  const isFollowing = followedProjects.has(project.id)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'technology', label: 'Technology' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'team', label: 'Team' },
    { id: 'research', label: 'Research', count: projectResearch.length },
    { id: 'echocheck', label: 'EchoCheck' },
    { id: 'risks', label: 'Risks' },
    { id: 'updates', label: 'Updates' },
  ]

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Discover', href: '/discover' }, { label: project.name }]} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              <img src={project.logo} alt={project.name} className="h-16 w-16 rounded-xl bg-raised border border-border" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-heading text-3xl font-semibold text-text-primary">{project.name}</h1>
                  <StatusBadge status={project.verificationStatus} />
                </div>
                <p className="text-text-muted mt-1">{project.tagline}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant="secondary">{project.chain}</Badge>
                  <Badge variant="outline">{project.stage}</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {project.website && <a href={project.website} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><Globe className="h-4 w-4" /> Website</Button></a>}
              {project.twitter && <a href={`https://x.com/${project.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><AtSign className="h-4 w-4" /> {project.twitter}</Button></a>}
              {project.discord && <a href={`https://${project.discord}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><MessageCircle className="h-4 w-4" /> Discord</Button></a>}
              {project.github && <a href={`https://${project.github}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><Code2 className="h-4 w-4" /> GitHub</Button></a>}
              <Button variant={isFollowing ? 'secondary' : 'primary'} size="sm" onClick={() => toggleFollow(project.id)}>
                <UserPlus className="h-4 w-4" /> {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>

            <div className="mt-8">
              <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
              <div className="mt-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <section><h3 className="font-heading text-lg font-semibold text-text-primary mb-2">About</h3><p className="text-sm text-text-muted">{project.description}</p></section>
                    {project.problem && <section><h3 className="font-heading text-lg font-semibold text-text-primary mb-2">Problem</h3><p className="text-sm text-text-muted">{project.problem}</p></section>}
                    {project.solution && <section><h3 className="font-heading text-lg font-semibold text-text-primary mb-2">Solution</h3><p className="text-sm text-text-muted">{project.solution}</p></section>}
                    {project.useCases && (
                      <section>
                        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">Use Cases</h3>
                        <ul className="space-y-1">{project.useCases.map((u) => <li key={u} className="text-sm text-text-muted flex items-center gap-2"><span className="text-echo-green">•</span>{u}</li>)}</ul>
                      </section>
                    )}
                  </div>
                )}
                {activeTab === 'technology' && project.technology && (
                  <p className="text-sm text-text-muted">{project.technology}</p>
                )}
                {activeTab === 'roadmap' && project.roadmap && (
                  <Timeline items={project.roadmap.map((r) => ({ date: r.quarter, title: r.title, status: r.status }))} />
                )}
                {activeTab === 'team' && project.team && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.team.map((m) => (
                      <Card key={m.name} padding="sm">
                        <div className="flex items-center gap-3">
                          <img src={m.avatar} alt={m.name} className="h-12 w-12 rounded-full" />
                          <div>
                            <p className="text-sm font-medium text-text-primary">{m.name}</p>
                            <p className="text-xs text-text-muted">{m.role}</p>
                          </div>
                        </div>
                        {m.bio && <p className="text-sm text-text-muted mt-3">{m.bio}</p>}
                      </Card>
                    ))}
                  </div>
                )}
                {activeTab === 'research' && (
                  projectResearch.length > 0 ? projectResearch.map((a) => <ResearchCardCompact key={a.id} article={a} />) : <p className="text-sm text-text-muted">No research articles yet.</p>
                )}
                {activeTab === 'echocheck' && (
                  <div>
                    <EchoScoreBreakdown scores={project.echoScore} />
                    <Link to={`/projects/${project.slug}/echocheck`} className="inline-block mt-4">
                      <Button>View Full EchoCheck Report <ExternalLink className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                )}
                {activeTab === 'risks' && project.risks && (
                  <div className="space-y-4">
                    {project.risks.map((r) => (
                      <Card key={r.title} padding="sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={r.severity === 'high' ? 'coral' : r.severity === 'medium' ? 'gold' : 'outline'}>{r.severity}</Badge>
                          <h4 className="text-sm font-medium text-text-primary">{r.title}</h4>
                        </div>
                        <p className="text-sm text-text-muted">{r.description}</p>
                      </Card>
                    ))}
                  </div>
                )}
                {activeTab === 'updates' && project.updates && (
                  <div className="space-y-4">
                    {project.updates.map((u) => (
                      <Card key={u.title} padding="sm">
                        <p className="text-xs text-text-muted">{formatDate(u.date)}</p>
                        <h4 className="text-sm font-medium text-text-primary mt-1">{u.title}</h4>
                        <p className="text-sm text-text-muted mt-1">{u.content}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card>
                <div className="text-center">
                  <ScoreRing score={project.echoScore.overall} size={100} label="EchoScore" />
                </div>
                <div className="mt-4 space-y-2">
                  {echoScoreDimensions.map((dimension) => (
                    <div key={dimension.key} className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">{dimension.label}</span>
                      <ScoreBadge score={project.echoScore[dimension.key]} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card padding="sm">
                <p className="text-xs text-text-muted">Community</p>
                <p className="font-heading text-xl font-semibold text-text-primary">{formatNumber(project.communityMetric)}</p>
                <p className="text-xs text-text-muted mt-2">Research: {project.researchStatus.replace('_', ' ')}</p>
                <p className="text-xs text-text-muted">Added {formatDate(project.addedAt)}</p>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>

      {relatedProjects.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">Related Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
