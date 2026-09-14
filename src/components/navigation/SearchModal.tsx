import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Users, FolderOpen, Hash } from 'lucide-react'
import { useUI } from '@/contexts/UIContext'
import type { SearchResult } from '@/types'

const typeIcons = {
  project: FolderOpen,
  research: FileText,
  contributor: Users,
  topic: Hash,
}

export function CommandPalette() {
  const { searchOpen, setSearchOpen, search } = useUI()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setResults(search(query))
  }, [query, search])

  useEffect(() => {
    if (!searchOpen) setQuery('')
  }, [searchOpen])

  if (!searchOpen) return null

  const handleSelect = (result: SearchResult) => {
    navigate(result.link)
    setSearchOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-elevated overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Search EchoSpot"
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-5 w-5 text-text-muted shrink-0" />
          <input
            autoFocus
            aria-label="Search projects, research, and contributors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, research, contributors..."
            className="flex-1 h-12 bg-transparent text-text-primary placeholder:text-text-disabled outline-none text-sm"
          />
          <kbd className="hidden sm:inline text-xs text-text-muted bg-raised px-1.5 py-0.5 rounded border border-border">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && query && (
            <p className="text-sm text-text-muted text-center py-8">No results found</p>
          )}
          {!query && (
            <p className="text-sm text-text-muted text-center py-8">Start typing to search...</p>
          )}
          {results.map((r) => {
            const Icon = typeIcons[r.type]
            return (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-raised transition-colors text-left"
              >
                <Icon className="h-4 w-4 text-text-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{r.title}</p>
                  <p className="text-xs text-text-muted capitalize">{r.type} · {r.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useUI()
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-card border border-border rounded-lg shadow-elevated p-4 flex items-start gap-3 animate-in"
          role="alert"
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">{toast.title}</p>
            {toast.message && <p className="text-xs text-text-muted mt-0.5">{toast.message}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-text-muted hover:text-text-primary text-lg leading-none" aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  )
}
