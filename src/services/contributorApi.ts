import { getJson, type ApiEnvelope, type ApiPagination } from '@/services/apiClient'

export interface ContributorSkill {
  slug: string
  name: string
}

export interface PublicContribution {
  id: number | string
  title: string
  type: string
  description: string
  date: string | null
}

interface ContributorResource {
  username: string
  display_name?: string | null
  bio?: string | null
  avatar_path?: string | null
  joined_at?: string | null
  roles: string[]
  skills: ContributorSkill[]
  contributions?: PublicContribution[]
}

export interface PublicContributor {
  username: string
  name: string
  bio: string
  avatar: string
  joinedAt: string | null
  roles: string[]
  skills: ContributorSkill[]
  contributions: PublicContribution[]
}

export interface ContributorDirectoryPage {
  contributors: PublicContributor[]
  pagination: ApiPagination
}

interface PaginatedContributorEnvelope extends ApiEnvelope<ContributorResource[]> {
  meta: ApiPagination
}

function mapContributor(resource: ContributorResource): PublicContributor {
  return {
    username: resource.username,
    name: resource.display_name || resource.username,
    bio: resource.bio ?? '',
    avatar: resource.avatar_path ?? '',
    joinedAt: resource.joined_at ?? null,
    roles: resource.roles,
    skills: resource.skills,
    contributions: resource.contributions ?? [],
  }
}

export async function fetchContributorDirectory(
  filters: { search: string; skill: string; page: number },
  signal?: AbortSignal,
): Promise<ContributorDirectoryPage> {
  const params = new URLSearchParams({ page: String(filters.page), per_page: '20' })
  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.skill) params.set('skill', filters.skill)

  const response = await getJson<PaginatedContributorEnvelope>(`/contributors?${params.toString()}`, signal)

  return {
    contributors: response.data.map(mapContributor),
    pagination: response.meta,
  }
}

export async function fetchContributorSkills(signal?: AbortSignal): Promise<ContributorSkill[]> {
  const response = await getJson<ApiEnvelope<ContributorSkill[]>>('/contributors/skills', signal)
  return response.data
}

export async function fetchContributorProfile(username: string, signal?: AbortSignal): Promise<PublicContributor> {
  const response = await getJson<ApiEnvelope<{ contributor: ContributorResource }>>(
    `/contributors/${encodeURIComponent(username)}`,
    signal,
  )

  return mapContributor(response.data.contributor)
}
