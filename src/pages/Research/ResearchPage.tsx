import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SearchInput, Select } from '@/components/ui/Input'
import { ResearchCard } from '@/components/research/ResearchCard'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import {
  fetchResearchArticles,
  fetchResearchCategories,
  fetchResearchTags,
  type ResearchArticlePage,
  type ResearchCategory,
  type ResearchTag,
} from '@/services/researchApi'

const emptyPage: ResearchArticlePage = {
  articles: [],
  pagination: { page: 1, per_page: 50, total: 0, total_pages: 1 },
}

export default function ResearchPage() {
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('')
  const [ecosystem, setEcosystem] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(emptyPage)
  const [categories, setCategories] = useState<ResearchCategory[]>([])
  const [tags, setTags] = useState<ResearchTag[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [ecosystems, setEcosystems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([fetchResearchCategories(controller.signal), fetchResearchTags(controller.signal)])
      .then(([categoryResults, tagResults]) => {
        setCategories(categoryResults)
        setTags(tagResults)
        setFilterError(null)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFilterError('Research filters could not be loaded.')
      })

    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchResearchArticles({ search: search.trim(), category, topic, ecosystem, tag, page }, controller.signal)
      .then((pageResult) => {
        setResult(pageResult)
        setTopics((current) => [...new Set([...current, ...pageResult.articles.map((article) => article.topic).filter(Boolean)])].sort())
        setEcosystems((current) => [...new Set([...current, ...pageResult.articles.map((article) => article.ecosystem).filter(Boolean)])].sort())
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Research articles could not be loaded. Check your connection and try again.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [search, category, topic, ecosystem, tag, page, retry])

  function clearFilters() {
    setSearch('')
    setTopic('')
    setCategory('')
    setEcosystem('')
    setTag('')
    setPage(1)
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">Research Library</h1>
        <p className="text-text-muted mt-2">In-depth Web3 research, Echo-Intel reports, and ecosystem analyses.</p>
      </motion.div>

      <div className="mt-8 space-y-4">
        <SearchInput aria-label="Search research" placeholder="Search research..." value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Select
            aria-label="Filter by research topic"
            options={[{ value: '', label: 'All Topics' }, ...topics.filter((value) => value !== topic).map((value) => ({ value, label: value })), ...(topic ? [{ value: topic, label: topic }] : [])]}
            value={topic}
            onChange={(event) => updateFilter(setTopic, event.target.value)}
          />
          <Select
            aria-label="Filter by research category"
            options={[{ value: '', label: 'All Categories' }, ...categories.map(({ slug, name }) => ({ value: slug, label: name }))]}
            value={category}
            onChange={(event) => updateFilter(setCategory, event.target.value)}
          />
          <Select
            aria-label="Filter by ecosystem"
            options={[{ value: '', label: 'All Ecosystems' }, ...ecosystems.filter((value) => value !== ecosystem).map((value) => ({ value, label: value })), ...(ecosystem ? [{ value: ecosystem, label: ecosystem }] : [])]}
            value={ecosystem}
            onChange={(event) => updateFilter(setEcosystem, event.target.value)}
          />
          <Select
            aria-label="Filter by research tag"
            options={[{ value: '', label: 'All Tags' }, ...tags.map(({ slug, name }) => ({ value: slug, label: name }))]}
            value={tag}
            onChange={(event) => updateFilter(setTag, event.target.value)}
          />
        </div>
        {filterError && (
          <div className="flex items-center gap-3 text-sm text-error" role="alert">
            <span>{filterError}</span>
            <Button variant="outline" size="sm" onClick={() => setRetry((current) => current + 1)}>Try again</Button>
          </div>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingState message="Loading research..." />
        ) : error ? (
          <ErrorState title="Research unavailable" description={error} onRetry={() => setRetry((current) => current + 1)} />
        ) : result.articles.length === 0 ? (
          <EmptyState
            title="No research found."
            description="Try a different search, topic, category, ecosystem, or tag."
            action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.articles.map((article) => <ResearchCard key={article.id} article={article} />)}
            </div>
            {result.pagination.total_pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                <span className="text-sm text-text-muted">Page {result.pagination.page} of {result.pagination.total_pages}</span>
                <Button variant="outline" size="sm" disabled={page >= result.pagination.total_pages} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
