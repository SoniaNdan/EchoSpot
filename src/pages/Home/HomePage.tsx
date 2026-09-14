import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, ShieldCheck, BookOpen, Users, ArrowRight, CheckCircle,
  Star, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge, StatusBadge, ScoreBadge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/Progress'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ResearchCardCompact } from '@/components/research/ResearchCard'
import { projects } from '@/data/projects'
import { researchArticles } from '@/data/research'
import { contributors } from '@/data/contributors'
import { echoScoreDimensions, getEchoScoreDimensionListLabel } from '@/lib/echoScore'
import { verificationStatusOptions } from '@/lib/verification'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const partners = ['Ethereum Foundation', 'Arbitrum', 'Chainlink', 'Optimism', 'Base', 'Polygon']

const homepageEchoScore = { builder: 92, product: 85, community: 78, transparency: 90, risk: 82 }

const faqs = [
  { q: 'What is EchoSpot?', a: 'EchoSpot is a Web3 discovery, research, and verification platform. We help researchers, builders, and communities evaluate projects with evidence-based frameworks like EchoCheck.' },
  { q: 'Is EchoCheck a financial audit?', a: 'No. EchoCheck is a research and transparency framework. It is not a financial guarantee, investment recommendation, or audit certification.' },
  { q: 'How do I contribute?', a: 'Join as a contributor to complete research tasks, EchoCheck reviews, and community bounties. Earn EchoPoints and build your reputation.' },
  { q: 'How do projects get listed?', a: 'Founders submit projects through our application process. Projects are reviewed by the EchoSpot research team before being published.' },
]

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 3)
  const highlights = researchArticles.slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <Badge variant="secondary" className="mb-4">Web3 Discovery Platform</Badge>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-bold text-text-primary leading-tight">
                Discover the Next Generation of Web3 Innovation.
              </h1>
              <p className="text-lg text-text-muted mt-6">
                Research. Verify. Explain. Amplify.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/discover"><Button size="lg">Explore Projects <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link to="/submit-project"><Button variant="outline" size="lg">Submit Your Project</Button></Link>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="hidden lg:block">
              <Card sheen className="relative">
                <div className="absolute top-0 left-0 right-0 h-0.5 gradient-accent-line rounded-t-xl" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Platform Overview</span>
                    <Badge variant="primary">Live</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-raised rounded-lg p-3">
                      <p className="text-xs text-text-muted">Projects Indexed</p>
                      <p className="font-heading text-2xl font-semibold text-text-primary">342</p>
                    </div>
                    <div className="bg-raised rounded-lg p-3">
                      <p className="text-xs text-text-muted">EchoCheck Verified</p>
                      <p className="font-heading text-2xl font-semibold text-echo-green">128</p>
                    </div>
                    <div className="bg-raised rounded-lg p-3">
                      <p className="text-xs text-text-muted">Research Articles</p>
                      <p className="font-heading text-2xl font-semibold text-text-primary">189</p>
                    </div>
                    <div className="bg-raised rounded-lg p-3">
                      <p className="text-xs text-text-muted">Contributors</p>
                      <p className="font-heading text-2xl font-semibold text-text-primary">1,240</p>
                    </div>
                  </div>
                  <div className="bg-raised rounded-lg p-3 flex items-center gap-3">
                    <ScoreRing score={87} size={56} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Aether Protocol</p>
                      <StatusBadge status="verified" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-y border-border py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <p className="text-xs text-text-muted text-center mb-6 uppercase tracking-wider">Trusted by teams across the ecosystem</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {partners.map((p) => (
              <span key={p} className="text-sm font-medium text-text-muted">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* What EchoSpot Does */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-semibold text-text-primary">Professional Infrastructure for Web3 Discovery</h2>
            <p className="text-text-muted mt-4">EchoSpot is the research platform serious builders and analysts rely on — not another crypto hype machine.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Discovery', desc: 'Find researched Web3 projects with transparent metadata and community signals.' },
              { icon: BookOpen, title: 'Research', desc: 'Access in-depth Echo-Intel reports, founder interviews, and ecosystem analyses.' },
              { icon: ShieldCheck, title: 'EchoCheck', desc: 'Evidence-based verification framework with expandable audit trails.' },
              { icon: Users, title: 'Contributors', desc: 'A reputation-driven ecosystem where research quality is rewarded.' },
            ].map((item) => (
              <motion.div key={item.title} {...fadeUp}>
                <Card hover className="h-full">
                  <item.icon className="h-8 w-8 text-echo-green mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-text-primary">{item.title}</h3>
                  <p className="text-sm text-text-muted mt-2">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EchoCheck */}
      <section className="py-20 bg-sidebar/50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <Badge variant="secondary" className="mb-4">EchoCheck</Badge>
              <h2 className="font-heading text-3xl font-semibold text-text-primary">Verification Built on Evidence</h2>
              <p className="text-text-muted mt-4">Five assessment dimensions — {getEchoScoreDimensionListLabel()} — with expandable evidence trails and source citations.</p>
              <ul className="mt-6 space-y-3">
                {verificationStatusOptions.map((status) => (
                  <li key={status.value} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle className="h-4 w-4 text-echo-green" />{status.label}
                  </li>
                ))}
              </ul>
              <Link to="/echocheck" className="inline-block mt-6"><Button>Explore EchoCheck</Button></Link>
            </motion.div>
            <motion.div {...fadeUp}>
              <Card sheen>
                {['Builder Assessment', 'Product Assessment', 'Risk Assessment'].map((title, i) => (
                  <div key={title} className={`flex items-center justify-between py-4 ${i < 2 ? 'border-b border-border' : ''}`}>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{title}</p>
                      <StatusBadge status={i === 0 ? 'verified' : i === 1 ? 'reviewed' : 'needs_review'} />
                    </div>
                    <ScoreBadge score={[92, 85, 71][i]} size="lg" />
                  </div>
                ))}
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EchoScore */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-heading text-3xl font-semibold text-text-primary">EchoScore</h2>
            <p className="text-text-muted mt-4 max-w-xl mx-auto">Multi-dimensional scoring that communicates project quality without misleading simplicity.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {echoScoreDimensions.map((dimension) => (
              <ScoreRing key={dimension.key} score={homepageEchoScore[dimension.key]} label={dimension.label} size={100} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-sidebar/50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-semibold text-text-primary">Featured Projects</h2>
            <Link to="/discover" className="text-sm text-echo-green hover:underline flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>

      {/* Research Highlights */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-semibold text-text-primary">Research Highlights</h2>
            <Link to="/research" className="text-sm text-echo-green hover:underline flex items-center gap-1">Research Library <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <Card padding="none">
            {highlights.map((a) => <ResearchCardCompact key={a.id} article={a} />)}
          </Card>
        </div>
      </section>

      {/* Contributors */}
      <section className="py-20 bg-sidebar/50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-heading text-2xl font-semibold text-text-primary">Contributor Ecosystem</h2>
            <p className="text-text-muted mt-2">Reputation-driven research powered by the community.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            <StatCard label="Active Contributors" value="1,240" change="+12%" icon={<Users className="h-4 w-4" />} />
            <StatCard label="Research Published" value="189" change="+8%" icon={<BookOpen className="h-4 w-4" />} />
            <StatCard label="EchoPoints Earned" value="2.4M" icon={<Star className="h-4 w-4" />} />
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {contributors.slice(0, 3).map((c) => (
              <Card key={c.id} hover>
                <div className="flex items-center gap-3">
                  <img src={c.avatar} alt={c.name} className="h-10 w-10 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{c.name}</p>
                    <p className="text-xs text-accent-gold">{c.reputation.toLocaleString()} reputation</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-text-primary text-center mb-12">How EchoSpot Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discover', desc: 'Browse researched Web3 projects with filters, EchoScores, and verification status.' },
              { step: '02', title: 'Research', desc: 'Read Echo-Intel reports, founder interviews, and ecosystem analyses.' },
              { step: '03', title: 'Verify', desc: 'Review EchoCheck assessments with evidence trails and source citations.' },
              { step: '04', title: 'Contribute', desc: 'Earn reputation and EchoPoints by contributing research and reviews.' },
            ].map((s) => (
              <Card key={s.step} hover>
                <span className="font-mono text-xs text-echo-green">{s.step}</span>
                <h3 className="font-heading text-lg font-semibold text-text-primary mt-2">{s.title}</h3>
                <p className="text-sm text-text-muted mt-2">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-sidebar/50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-text-primary text-center mb-12">What Researchers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'EchoSpot replaced three spreadsheets and a Telegram group for our due diligence workflow.', author: 'Protocol Research Lead' },
              { quote: 'The EchoCheck framework gives us a structured way to evaluate projects without hype bias.', author: 'DeFi Analyst' },
              { quote: 'Finally a platform that treats Web3 research like professional infrastructure.', author: 'Ecosystem Fund Manager' },
            ].map((t, i) => (
              <Card key={i} sheen>
                <p className="text-sm text-text-secondary italic">"{t.quote}"</p>
                <p className="text-xs text-text-muted mt-4">— {t.author}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold text-text-primary text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-card border border-border rounded-xl">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-medium text-text-primary">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-6 pb-4 text-sm text-text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero border-t border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold text-text-primary">Ready to explore Web3 with clarity?</h2>
          <p className="text-text-muted mt-4">Join researchers, builders, and contributors on EchoSpot.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/discover"><Button size="lg">Explore Projects</Button></Link>
            <Link to="/register"><Button variant="outline" size="lg">Create Account</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
