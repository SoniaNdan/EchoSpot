import type { ResearchArticle } from '@/types'
import { getJson } from '@/services/apiClient'
import type { ApiEnvelope, ApiPagination } from '@/services/apiClient'

export { getJson, getApiErrorStatus, type ApiEnvelope, type ApiPagination } from '@/services/apiClient'

interface ResearchArticleResource {
  id: number | string
  slug: string
  title: string
  summary: string
  content: string
  category?: string
  category_name?: string
  topic?: string
  ecosystem?: string
  cover_image_url?: string
  author?: { username?: string; display_name?: string; avatar_path?: string } | null
  published_at?: string
  created_at?: string
  reading_minutes?: number
}

export interface ResearchCategory {
  slug: string
  name: string
}

export interface ResearchTag {
  slug: string
  name: string
}

export type ResearchPagination = ApiPagination

export interface ResearchArticlePage {
  articles: ResearchArticle[]
  pagination: ResearchPagination
}

interface PaginatedEnvelope extends ApiEnvelope<ResearchArticleResource[]> {
  meta: ApiPagination
}

function mapArticle(article: ResearchArticleResource): ResearchArticle {
  const authorName = article.author?.display_name || article.author?.username || 'EchoSpot Research'

  return {
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: article.content,
    author: authorName,
    authorId: article.author?.username ?? '',
    authorAvatar: article.author?.avatar_path ?? '',
    date: article.published_at ?? article.created_at ?? '',
    readTime: article.reading_minutes ?? 1,
    category: article.category ?? '',
    categoryLabel: article.category_name ?? article.category ?? '',
    topic: article.topic ?? '',
    ecosystem: article.ecosystem ?? '',
    status: 'published',
    image: article.cover_image_url ?? '',
  }
}

export async function fetchResearchArticles(
  filters: { search: string; category: string; topic: string; ecosystem: string; tag: string; page: number },
  signal?: AbortSignal,
): Promise<ResearchArticlePage> {
  const params = new URLSearchParams({ page: String(filters.page), per_page: '50' })

  for (const key of ['search', 'category', 'topic', 'ecosystem', 'tag'] as const) {
    const value = filters[key]
    if (value) params.set(key, value)
  }

  const response = await getJson<PaginatedEnvelope>(`/research/articles?${params.toString()}`, signal)

  return {
    articles: response.data.map(mapArticle),
    pagination: response.meta,
  }
}

export async function fetchResearchCategories(signal?: AbortSignal): Promise<ResearchCategory[]> {
  const response = await getJson<ApiEnvelope<ResearchCategory[]>>('/research/categories', signal)
  return response.data
}

export async function fetchResearchTags(signal?: AbortSignal): Promise<ResearchTag[]> {
  const response = await getJson<ApiEnvelope<ResearchTag[]>>('/research/tags', signal)
  return response.data
}

export async function fetchResearchArticle(slug: string, signal?: AbortSignal): Promise<ResearchArticle> {
  const response = await getJson<ApiEnvelope<{ article: ResearchArticleResource }>>(
    `/research/articles/${encodeURIComponent(slug)}`,
    signal,
  )

  return mapArticle(response.data.article)
}

export { getApiErrorStatus as getResearchApiErrorStatus } from '@/services/apiClient'
