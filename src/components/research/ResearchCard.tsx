import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Bookmark, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { useUI } from '@/contexts/UIContext'
import { researchTypeLabels } from '@/data/research'
import type { ResearchArticle } from '@/types'

function ResearchImage({ src, className }: { src: string; className: string }) {
  const [hasImageError, setHasImageError] = useState(!src)

  if (hasImageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-raised border border-border text-xs text-text-muted`} aria-hidden="true">
        EchoSpot Research
      </div>
    )
  }

  return <img src={src} alt="" className={className} onError={() => setHasImageError(true)} />
}

export function ResearchCard({ article }: { article: ResearchArticle }) {
  const { bookmarks, toggleBookmark } = useUI()

  return (
    <Card hover sheen className="flex flex-col h-full overflow-hidden p-0">
      <div className="aspect-[16/9] overflow-hidden">
        <ResearchImage src={article.image} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{researchTypeLabels[article.category]}</Badge>
          <Badge variant="outline">{article.topic}</Badge>
        </div>
        <Link to={`/research/${article.slug}`} className="font-heading text-base font-semibold text-text-primary hover:text-echo-green transition-colors line-clamp-2">
          {article.title}
        </Link>
        <p className="text-sm text-text-muted mt-2 line-clamp-2 flex-1">{article.summary}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Avatar src={article.authorAvatar} name={article.author} size="sm" />
            <div>
              <p className="text-xs text-text-secondary">{article.author}</p>
              <p className="text-xs text-text-muted">{formatDate(article.date)} · {article.readTime} min</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleBookmark(article.id)}
              className="p-1.5 text-text-muted hover:text-echo-green transition-colors"
              aria-label={`${bookmarks.has(article.id) ? 'Remove bookmark for' : 'Bookmark'} ${article.title}`}
              aria-pressed={bookmarks.has(article.id)}
            >
              <Bookmark className={`h-4 w-4 ${bookmarks.has(article.id) ? 'fill-echo-green text-echo-green' : ''}`} />
            </button>
            <Link to={`/research/${article.slug}`}>
              <span className="inline-flex items-center gap-1 text-xs text-echo-green hover:underline">
                Read <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ResearchCardCompact({ article }: { article: ResearchArticle }) {
  return (
    <Link to={`/research/${article.slug}`} className="flex gap-4 p-4 rounded-lg hover:bg-raised transition-colors group">
      <ResearchImage src={article.image} className="h-16 w-24 rounded-lg object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <Badge variant="secondary" className="mb-1">{researchTypeLabels[article.category]}</Badge>
        <h4 className="text-sm font-medium text-text-primary group-hover:text-echo-green transition-colors line-clamp-1">{article.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
          <Clock className="h-3 w-3" />
          <span>{article.readTime} min read</span>
        </div>
      </div>
    </Link>
  )
}
