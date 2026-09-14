import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Notification, SearchResult } from '@/types'
import { notifications as mockNotifications } from '@/data/analytics'
import { projects } from '@/data/projects'
import { researchArticles } from '@/data/research'
import { contributors } from '@/data/contributors'

interface UIContextType {
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  notifications: Notification[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadCount: number
  search: (query: string) => SearchResult[]
  bookmarks: Set<string>
  toggleBookmark: (id: string) => void
  followedProjects: Set<string>
  toggleFollow: (id: string) => void
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

interface Toast {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'info'
}

const UIContext = createContext<UIContextType | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [followedProjects, setFollowedProjects] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const search = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const results: SearchResult[] = []

    projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((p) => results.push({ id: p.id, type: 'project', title: p.name, subtitle: p.category, link: `/projects/${p.slug}` }))

    researchArticles
      .filter((a) => a.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((a) => results.push({ id: a.id, type: 'research', title: a.title, subtitle: a.category, link: `/research/${a.slug}` }))

    contributors
      .filter((c) => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((c) => results.push({ id: c.id, type: 'contributor', title: c.name, subtitle: `@${c.username}`, link: `/contributors/${c.id}` }))

    return results
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleFollow = useCallback((id: string) => {
    setFollowedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <UIContext.Provider
      value={{
        searchOpen,
        setSearchOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,
        search,
        bookmarks,
        toggleBookmark,
        followedProjects,
        toggleFollow,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
