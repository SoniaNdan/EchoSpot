import type { User, UserRole } from '@/types'
import { getJson, postJson, type ApiEnvelope } from '@/services/apiClient'

interface UserResource {
  id: number | string
  name: string
  email: string
  status: string
  email_verified_at: string | null
  roles: string[]
}

interface ProfileResource {
  username: string
  display_name: string | null
  avatar_path: string | null
}

interface CurrentUserResource {
  user: UserResource
  profile: ProfileResource | null
}

interface TokenResponse {
  user: UserResource
  token: string
  token_type: 'Bearer'
}

const rolePriority: UserRole[] = ['super_admin', 'admin', 'founder', 'researcher', 'contributor', 'user']

function mapUser(resource: CurrentUserResource): User {
  const { user, profile } = resource
  const role = rolePriority.find((candidate) => user.roles.includes(candidate)) ?? 'user'

  return {
    id: String(user.id),
    email: user.email,
    name: profile?.display_name || user.name,
    username: profile?.username ?? '',
    avatar: profile?.avatar_path ?? '',
    role,
    roles: user.roles,
    status: user.status,
  }
}

export async function loginWithPassword(email: string, password: string): Promise<string> {
  const response = await postJson<ApiEnvelope<TokenResponse>>('/auth/login', { email, password }, false)
  return response.data.token
}

export async function registerAccount(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<string> {
  const response = await postJson<ApiEnvelope<TokenResponse>>('/auth/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  }, false)

  return response.data.token
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await getJson<ApiEnvelope<CurrentUserResource>>('/auth/me')
  return mapUser(response.data)
}

export async function logoutCurrentSession(): Promise<void> {
  await postJson<ApiEnvelope<{ message: string }>>('/auth/logout', {})
}
