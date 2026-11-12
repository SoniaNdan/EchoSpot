import type { UserRole } from '@/types'

export const roleWorkspacePaths: Partial<Record<UserRole, string>> = {
  contributor: '/dashboard/contributor',
  researcher: '/dashboard/contributor',
  founder: '/founder',
  admin: '/admin',
  super_admin: '/admin',
}

export function getDefaultDashboardPath(role?: UserRole | null) {
  if (!role) return '/login'
  return roleWorkspacePaths[role] ?? '/'
}
