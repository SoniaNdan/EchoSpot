import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { User } from '@/types'
import { configureApiAuthentication } from '@/services/apiClient'
import { fetchCurrentUser, loginWithPassword, logoutCurrentSession, registerAccount } from '@/services/authApi'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const clearSession = useCallback(() => {
    tokenRef.current = null
    setToken(null)
    setUser(null)
  }, [])

  const getToken = useCallback(() => tokenRef.current, [])

  useEffect(() => configureApiAuthentication(getToken, clearSession), [getToken, clearSession])

  const establishSession = useCallback(async (nextToken: string) => {
    tokenRef.current = nextToken
    setToken(nextToken)

    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
    } catch (error) {
      clearSession()
      throw error
    }
  }, [clearSession])

  const login = useCallback(async (email: string, password: string) => {
    clearSession()
    const nextToken = await loginWithPassword(email, password)
    await establishSession(nextToken)
  }, [clearSession, establishSession])

  const register = useCallback(async (email: string, password: string, name: string, passwordConfirmation: string) => {
    clearSession()
    const nextToken = await registerAccount(name, email, password, passwordConfirmation)
    await establishSession(nextToken)
  }, [clearSession, establishSession])

  const logout = useCallback(async () => {
    try {
      if (tokenRef.current) await logoutCurrentSession()
    } catch {
      // Always clear the in-memory session, even if the server cannot be reached.
    } finally {
      clearSession()
    }
  }, [clearSession])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
