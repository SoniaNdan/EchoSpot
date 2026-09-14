import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import { SearchInput, Select } from '@/components/ui/Input'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { projects } from '@/data/projects'
import type { VerificationStatus } from '@/types'
import { verificationStatusOptions } from '@/lib/verification'

export default function DiscoverPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [chain, setChain] = useState('all')
  const [stage, setStage] = useState('all')
  const [verification, setVerification] = useState<VerificationStatus | 'all'>('all')
  const [minScore, setMinScore] = useState('0')
  const [sort, setSort] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['all', ...new Set(projects.map((p) => p.category))]
  const chains = ['all', ...new Set(projects.map((p) => p.chain))]

  function clearFilters() {
    setSearch('')
    setCategory('all')
    setChain('all')
    setStage('all')
    setVerification('all')
    setMinScore('0')
    setSort('recommended')
  }

  const filtered = useMemo(() => {
    let result = [...projects]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (category !== 'all') result = result.filter((p) => p.category === category)
    if (chain !== 'all') result = result.filter((p) => p.chain === chain)
    if (stage !== 'all') result = result.filter((p) => p.stage === stage)
    if (verification !== 'all') result = result.filter((p) => p.verificationStatus === verification)
    if (minScore !== '0') result = result.filter((p) => p.echoScore.overall >= parseInt(minScore))

    switch (sort) {
      case 'trending': result.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0)); break
      case 'recent': result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()); break
      case 'score': result.sort((a, b) => b.echoScore.overall - a.echoScore.overall); break
    }
    return result
  }, [search, category, chain, stage, verification, minScore, sort])

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">Discover Projects</h1>
        <p className="text-text-muted mt-2 max-w-2xl">
          Explore researched Web3 projects with EchoCheck verification, EchoScores, and community signals.
        </p>
      </motion.div>

      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput aria-label="Search projects" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select
            options={[
              { value: 'recommended', label: 'Recommended' },
              { value: 'trending', label: 'Trending' },
              { value: 'recent', label: 'Recently Added' },
              { value: 'score', label: 'Highest EchoScore' },
            ]}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sm:w-48"
            aria-label="Sort projects"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-sm text-text-secondary hover:bg-raised sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
          <Select aria-label="Filter by category" options={categories.map((c) => ({ value: c, label: c === 'all' ? 'All Categories' : c }))} value={category} onChange={(e) => setCategory(e.target.value)} />
          <Select aria-label="Filter by chain" options={chains.map((c) => ({ value: c, label: c === 'all' ? 'All Chains' : c }))} value={chain} onChange={(e) => setChain(e.target.value)} />
          <Select aria-label="Filter by stage" options={[{ value: 'all', label: 'All Stages' }, { value: 'idea', label: 'Idea' }, { value: 'mvp', label: 'MVP' }, { value: 'testnet', label: 'Testnet' }, { value: 'mainnet', label: 'Mainnet' }, { value: 'scaling', label: 'Scaling' }]} value={stage} onChange={(e) => setStage(e.target.value)} />
          <Select aria-label="Filter by verification status" options={[{ value: 'all', label: 'All Status' }, ...verificationStatusOptions]} value={verification} onChange={(e) => setVerification(e.target.value as VerificationStatus | 'all')} />
          <Select aria-label="Filter by minimum EchoScore" options={[{ value: '0', label: 'Any EchoScore' }, { value: '60', label: '60+' }, { value: '70', label: '70+' }, { value: '80', label: '80+' }, { value: '90', label: '90+' }]} value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-text-muted mb-4">{filtered.length} projects found</p>
        {filtered.length === 0 ? (
          <EmptyState
            title="No projects match these filters."
            description="Try removing a filter or clearing your search."
            action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
