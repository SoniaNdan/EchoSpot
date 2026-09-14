import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SearchInput, Select } from '@/components/ui/Input'
import { ResearchCard } from '@/components/research/ResearchCard'
import { EmptyState } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { researchArticles, researchTypeLabels } from '@/data/research'

export default function ResearchPage() {
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('all')
  const [type, setType] = useState('all')
  const [ecosystem, setEcosystem] = useState('all')

  const topics = ['all', ...new Set(researchArticles.map((a) => a.topic))]
  const ecosystems = ['all', ...new Set(researchArticles.map((a) => a.ecosystem))]

  function clearFilters() {
    setSearch('')
    setTopic('all')
    setType('all')
    setEcosystem('all')
  }

  const filtered = useMemo(() => {
    return researchArticles.filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
      if (topic !== 'all' && a.topic !== topic) return false
      if (type !== 'all' && a.category !== type) return false
      if (ecosystem !== 'all' && a.ecosystem !== ecosystem) return false
      return true
    })
  }, [search, topic, type, ecosystem])

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">Research Library</h1>
        <p className="text-text-muted mt-2">In-depth Web3 research, Echo-Intel reports, and ecosystem analyses.</p>
      </motion.div>

      <div className="mt-8 space-y-4">
        <SearchInput aria-label="Search research" placeholder="Search research..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Select aria-label="Filter by research topic" options={topics.map((t) => ({ value: t, label: t === 'all' ? 'All Topics' : t }))} value={topic} onChange={(e) => setTopic(e.target.value)} />
          <Select aria-label="Filter by research type" options={[{ value: 'all', label: 'All Types' }, ...Object.entries(researchTypeLabels).map(([v, l]) => ({ value: v, label: l }))]} value={type} onChange={(e) => setType(e.target.value)} />
          <Select aria-label="Filter by ecosystem" options={ecosystems.map((e) => ({ value: e, label: e === 'all' ? 'All Ecosystems' : e }))} value={ecosystem} onChange={(e) => setEcosystem(e.target.value)} />
        </div>
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            title="No research found."
            description="Try a different search, topic, type, or ecosystem."
            action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => <ResearchCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}
