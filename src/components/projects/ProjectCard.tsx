import { Link } from 'react-router-dom'
import { Users, ArrowRight, Bookmark } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, StatusBadge, ScoreBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/lib/utils'
import { useUI } from '@/contexts/UIContext'
import type { Project } from '@/types'

export function ProjectCard({ project }: { project: Project }) {
  const { followedProjects, toggleFollow, bookmarks, toggleBookmark } = useUI()
  const isFollowing = followedProjects.has(project.id)

  return (
    <Card hover sheen className="flex flex-col h-full">
      <div className="flex items-start gap-3 mb-4">
        <img src={project.logo} alt={project.name} className="h-12 w-12 rounded-lg bg-raised border border-border" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to={`/projects/${project.slug}`} className="font-heading font-semibold text-text-primary hover:text-echo-green transition-colors truncate">
              {project.name}
            </Link>
            {project.featured && <Badge variant="coral">Featured</Badge>}
          </div>
          <p className="text-xs text-text-muted mt-0.5">{project.category} · {project.chain}</p>
        </div>
        <StatusBadge status={project.verificationStatus} />
      </div>

      <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-1">{project.tagline}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-text-muted">EchoScore</span>
            <ScoreBadge score={project.echoScore.overall} />
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">{formatNumber(project.communityMetric)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleBookmark(project.id)}
            className="p-1.5 text-text-muted hover:text-echo-green transition-colors"
            aria-label={`${bookmarks.has(project.id) ? 'Remove bookmark for' : 'Bookmark'} ${project.name}`}
            aria-pressed={bookmarks.has(project.id)}
          >
            <Bookmark className={`h-4 w-4 ${bookmarks.has(project.id) ? 'fill-echo-green text-echo-green' : ''}`} />
          </button>
          <Button variant="ghost" size="sm" onClick={() => toggleFollow(project.id)}>
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Link to={`/projects/${project.slug}`}>
            <Button variant="outline" size="sm">
              View <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
