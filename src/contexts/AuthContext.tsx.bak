import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
}

const mockUser: User = {
  id: '1',
  email: 'sarah@example.com',
  name: 'Sarah Mitchell',
  username: 'sarahm',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  role: 'contributor',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  echoPoints: 15600,
  level: 12,
  reputation: 2840,
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('echospot_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800))
    const u = { ...mockUser, email }
    setUser(u)
    localStorage.setItem('echospot_user', JSON.stringify(u))
    return true
  }, [])

  const register = useCallback(async (email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 800))
    const u = { ...mockUser, email, name, username: name.toLowerCase().replace(/\s/g, ''), echoPoints: 0, level: 1, reputation: 0 }
    setUser(u)
    localStorage.setItem('echospot_user', JSON.stringify(u))
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('echospot_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
