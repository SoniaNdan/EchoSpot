import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { projects, getProjectBySlug, getEchoCheckBySlug } from '@/data/projects'
import { EchoCheckOverview, EchoCheckSectionCard } from '@/components/echocheck/EchoCheckComponents'
import { Card } from '@/components/ui/Card'
import { StatusBadge, ScoreBadge } from '@/components/ui/Badge'
import { getEchoScoreDimensionListLabel } from '@/lib/echoScore'

export default function EchoCheckPage() {
  const { slug } = useParams<{ slug: string }>()

  if (slug) {
    const project = getProjectBySlug(slug)
    const report = getEchoCheckBySlug(slug)

    if (!project || !report) {
      return (
        <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
          <h1 className="font-heading text-2xl text-text-primary">EchoCheck report not found</h1>
          <Link to="/echocheck" className="text-echo-green mt-4 inline-block">Back to EchoCheck</Link>
        </div>
      )
    }

    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <Link to={`/projects/${slug}`} className="text-sm text-text-muted hover:text-echo-green">← {project.name}</Link>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="flex items-center gap-4 mb-8">
            <img src={project.logo} alt={project.name} className="h-12 w-12 rounded-lg" />
            <div>
              <h1 className="font-heading text-2xl font-semibold text-text-primary">{project.name} — EchoCheck</h1>
              <StatusBadge status={report.overallStatus} />
            </div>
          </div>
          <EchoCheckOverview report={report} />
          <div className="mt-6 space-y-4">
            {report.sections.map((s) => <EchoCheckSectionCard key={s.id} section={s} />)}
          </div>
        </motion.div>
      </div>
    )
  }

  const verifiedProjects = projects.filter((p) => p.verificationStatus === 'verified' || p.verificationStatus === 'reviewed')

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-echo-green" />
          <h1 className="font-heading text-3xl font-semibold text-text-primary">EchoCheck</h1>
        </div>
        <p className="text-text-muted max-w-2xl">
          Evidence-based verification framework for Web3 projects. EchoCheck is a research and transparency tool — not a financial guarantee.
        </p>
      </motion.div>

      <Card className="mt-8 bg-info-bg border-info/30">
        <p className="text-sm text-text-secondary">
          EchoCheck evaluates projects across five dimensions: {getEchoScoreDimensionListLabel()}. Each assessment includes scores, evidence, sources, and reviewer attribution.
        </p>
      </Card>

      <h2 className="font-heading text-xl font-semibold text-text-primary mt-12 mb-6">Verified & Reviewed Projects</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verifiedProjects.map((p) => (
          <Link key={p.id} to={`/projects/${p.slug}/echocheck`}>
            <Card hover sheen>
              <div className="flex items-center gap-3">
                <img src={p.logo} alt={p.name} className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{p.name}</p>
                  <StatusBadge status={p.verificationStatus} />
                </div>
                <ScoreBadge score={p.echoScore.overall} size="lg" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
