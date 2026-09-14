import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.png'

const publicLinks = [
  { to: '/discover', label: 'Discover' },
  { to: '/research', label: 'Research' },
  { to: '/echocheck', label: 'EchoCheck' },
  { to: '/contributors', label: 'Contributors' },
  { to: '/about', label: 'About' },
]

export function PublicNav() {
  const { isAuthenticated } = useAuth()
  const { setSearchOpen, setMobileMenuOpen, mobileMenuOpen, unreadCount } = useUI()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-sidebar/80 glass-nav border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="EchoSpot" className="h-8 w-8 rounded-full" />
          <span className="font-heading font-semibold text-text-primary hidden sm:block">EchoSpot</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm rounded-lg transition-colors',
                  isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-raised border border-border text-sm text-text-muted hover:border-border-strong transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
            <kbd className="text-xs bg-canvas px-1 rounded border border-border">⌘K</kbd>
          </button>

          {isAuthenticated && (
            <Link
              to="/notifications"
              className="relative p-2 text-text-muted hover:text-text-primary"
              aria-label={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span aria-hidden="true" className="absolute top-1 right-1 h-2 w-2 bg-echo-green rounded-full" />
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <Button size="sm" onClick={() => navigate('/dashboard/contributor')}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Join EchoSpot</Button>
            </>
          )}
          <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/submit-project')}>
            Submit Project
          </Button>

          <button
            className="lg:hidden p-2 text-text-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-sidebar px-4 py-4 space-y-1">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn('block px-3 py-2.5 text-sm rounded-lg', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted')
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2.5 text-sm text-text-muted">
            Search
          </button>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="EchoSpot" className="h-8 w-8 rounded-full" />
              <span className="font-heading font-semibold text-text-primary">EchoSpot</span>
            </div>
            <p className="text-sm text-text-muted">Web3 discovery, research, verification, and contributor ecosystem.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Platform</h4>
            <div className="space-y-2">
              {['Discover', 'Research', 'EchoCheck', 'Contributors'].map((l) => (
                <Link key={l} to={`/${l.toLowerCase()}`} className="block text-sm text-text-muted hover:text-echo-green">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Community</h4>
            <div className="space-y-2">
              {['Rewards', 'Leaderboards', 'Submit Project'].map((l) => (
                <Link key={l} to={`/${l.toLowerCase().replace(' ', '-')}`} className="block text-sm text-text-muted hover:text-echo-green">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Legal</h4>
            <div className="space-y-2">
              {['Privacy', 'Terms', 'Disclaimer'].map((l) => (
                <span key={l} className="block text-sm text-text-muted">{l}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-xs text-text-muted">
          © 2026 EchoSpot. EchoCheck is a research framework, not a financial guarantee.
        </div>
      </div>
    </footer>
  )
}
