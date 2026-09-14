import { delay } from '@/lib/utils'
import { projects, getProjectBySlug, getEchoCheckBySlug } from '@/data/projects'
import { researchArticles, getResearchBySlug } from '@/data/research'
import { contributors, getContributorById, leaderboards, bountyQuests } from '@/data/contributors'
import { notifications, rewards, campaigns, contributorAnalytics, founderAnalytics, adminAnalytics, levelThresholds } from '@/data/analytics'
import type { Project, ResearchArticle, Contributor, EchoCheckReport } from '@/types'

export async function fetchProjects(): Promise<Project[]> {
  await delay(300)
  return projects
}

export async function fetchProject(slug: string): Promise<Project | undefined> {
  await delay(200)
  return getProjectBySlug(slug)
}

export async function fetchEchoCheck(slug: string): Promise<EchoCheckReport | undefined> {
  await delay(200)
  return getEchoCheckBySlug(slug)
}

export async function fetchResearch(): Promise<ResearchArticle[]> {
  await delay(300)
  return researchArticles
}

export async function fetchResearchArticle(slug: string): Promise<ResearchArticle | undefined> {
  await delay(200)
  return getResearchBySlug(slug)
}

export async function fetchContributors(): Promise<Contributor[]> {
  await delay(300)
  return contributors
}

export async function fetchContributor(id: string): Promise<Contributor | undefined> {
  await delay(200)
  return getContributorById(id)
}

export { leaderboards, bountyQuests, notifications, rewards, campaigns, contributorAnalytics, founderAnalytics, adminAnalytics, levelThresholds }
