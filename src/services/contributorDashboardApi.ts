import { getJson, patchJson, postJson, type ApiEnvelope, type ApiPagination } from '@/services/apiClient'

export interface ContributorProfile {
  username: string
  display_name: string | null
  bio: string | null
  avatar_path: string | null
  joined_at: string | null
}

export interface Contribution {
  id: number | string
  title: string
  type: 'research' | 'review' | 'writing' | 'design' | 'community' | 'other'
  description: string
  evidence_url?: string
  status: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected'
  review_note?: string
  submitted_at?: string
  created_at?: string
  updated_at?: string
}

export interface ContributionPage {
  contributions: Contribution[]
  pagination: ApiPagination
}

interface ContributorResource extends ContributorProfile {
  roles: string[]
  skills: { slug: string; name: string }[]
}

interface PaginatedContributionEnvelope extends ApiEnvelope<Contribution[]> {
  meta: ApiPagination
}

interface ContributionEnvelope extends ApiEnvelope<{ contribution: Contribution }> {}

export async function fetchMyContributorProfile(signal?: AbortSignal): Promise<ContributorProfile> {
  const response = await getJson<ApiEnvelope<{ contributor: ContributorResource }>>('/contributors/me', signal)
  return response.data.contributor
}

export async function updateMyContributorProfile(
  profile: Pick<ContributorProfile, 'username' | 'display_name' | 'bio' | 'avatar_path'>,
): Promise<ContributorProfile> {
  const response = await patchJson<ApiEnvelope<{ contributor: ContributorResource }>>('/contributors/me', profile)
  return response.data.contributor
}

export async function fetchMyContributions(page = 1, signal?: AbortSignal): Promise<ContributionPage> {
  const params = new URLSearchParams({ page: String(page), per_page: '20' })
  const response = await getJson<PaginatedContributionEnvelope>(`/contributions/mine?${params.toString()}`, signal)

  return { contributions: response.data, pagination: response.meta }
}

export type ContributionInput = Pick<Contribution, 'title' | 'type' | 'description'> & {
  evidence_url?: string | null
}

export async function createContribution(input: ContributionInput): Promise<Contribution> {
  const response = await postJson<ContributionEnvelope>('/contributions', input)
  return response.data.contribution
}

export async function updateContribution(id: number | string, input: ContributionInput): Promise<Contribution> {
  const response = await patchJson<ContributionEnvelope>(`/contributions/${id}`, input)
  return response.data.contribution
}

export async function submitContribution(id: number | string): Promise<Contribution> {
  const response = await postJson<ContributionEnvelope>(`/contributions/${id}/submit`, {})
  return response.data.contribution
}
