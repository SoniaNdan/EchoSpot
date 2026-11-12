const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')

export interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export interface ApiPagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

let tokenProvider: (() => string | null) | null = null
let unauthorizedHandler: (() => void) | null = null

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function configureApiAuthentication(
  getToken: () => string | null,
  onUnauthorized: () => void,
): () => void {
  tokenProvider = getToken
  unauthorizedHandler = onUnauthorized

  return () => {
    if (tokenProvider === getToken) tokenProvider = null
    if (unauthorizedHandler === onUnauthorized) unauthorizedHandler = null
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const token = authenticated ? tokenProvider?.() ?? null : null
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token) unauthorizedHandler?.()
    const payload = body && typeof body === 'object' ? body as Record<string, unknown> : {}
    const apiError = payload.error && typeof payload.error === 'object'
      ? payload.error as Record<string, unknown>
      : {}
    const rawErrors = payload.errors && typeof payload.errors === 'object'
      ? payload.errors
      : apiError.errors
    const validationErrors = rawErrors && typeof rawErrors === 'object'
      ? rawErrors as Record<string, string[]>
      : undefined
    const message = typeof apiError.message === 'string'
      ? apiError.message
      : typeof payload.message === 'string'
        ? payload.message
        : `Request failed (${response.status})`

    throw new ApiError(message, response.status, typeof apiError.code === 'string' ? apiError.code : undefined, validationErrors)
  }

  return body as T
}

export function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(path, { method: 'GET', signal })
}

export function postJson<T>(path: string, payload: unknown, authenticated = true): Promise<T> {
  return requestJson<T>(path, { method: 'POST', body: JSON.stringify(payload) }, authenticated)
}

export function patchJson<T>(path: string, payload: unknown): Promise<T> {
  return requestJson<T>(path, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.validationErrors) {
    const messages = Object.values(error.validationErrors).flat()
    if (messages.length) return messages.join(' ')
  }

  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
