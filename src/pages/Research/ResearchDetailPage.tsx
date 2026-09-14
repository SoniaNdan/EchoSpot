import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock } from 'lucide-react'
import { getResearchBySlug } from '@/data/research'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { researchTypeLabels } from '@/data/research'

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-text-secondary">{part.slice(2, -2)}</strong>
    }

    return part
  })
}

export default function ResearchDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const article = getResearchBySlug(slug ?? '')

  if (!article) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-text-primary">Article not found</h1>
        <Link to="/research" className="text-echo-green mt-4 inline-block">Back to Research</Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/research" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-echo-green mb-6">
        <ArrowLeft className="h-4 w-4" /> Research Library
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">{researchTypeLabels[article.category]}</Badge>
          <Badge variant="outline">{article.topic}</Badge>
        </div>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">{article.title}</h1>
        <p className="text-lg text-text-muted mt-4">{article.summary}</p>

        <div className="flex items-center gap-4 mt-6 pb-6 border-b border-border">
          <Avatar src={article.authorAvatar} name={article.author} size="md" />
          <div>
            <p className="text-sm text-text-primary">{article.author}</p>
            <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
              <span>{formatDate(article.date)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} min read</span>
            </div>
          </div>
        </div>

        <img src={article.image} alt="" className="w-full rounded-xl mt-8 aspect-[16/9] object-cover" />

        <div className="prose prose-invert mt-8 space-y-4">
          {article.content.trim().split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="font-heading text-xl font-semibold text-text-primary mt-8">{line.slice(3)}</h2>
            if (line.startsWith('- ')) return <li key={i} className="text-sm text-text-muted ml-4">{renderInlineMarkdown(line.slice(2))}</li>
            if (line.trim() === '') return null
            return <p key={i} className="text-sm text-text-muted leading-relaxed">{renderInlineMarkdown(line)}</p>
          })}
        </div>
      </motion.div>
    </article>
  )
}
