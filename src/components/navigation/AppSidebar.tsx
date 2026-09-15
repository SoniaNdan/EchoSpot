import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Compass, FolderOpen, BookOpen, ShieldCheck,
  Users, Gift, Trophy, Bell, Settings, User, LogOut, Menu, X, Search,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.png'

const appLinks = [
  { to: '/dashboard/contributor', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/research', label: 'Research', icon: BookOpen },
  { to: '/echocheck', label: 'EchoCheck', icon: ShieldCheck },
  { to: '/contributors', label: 'Contributors', icon: Users },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/leaderboards', label: 'Leaderboards', icon: Trophy },
]

const roleLinks: Record<string, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  founder: [{ to: '/founder', label: 'Founder Console', icon: FolderOpen }],
  admin: [{ to: '/admin', label: 'Admin Console', icon: ShieldCheck }],
}

export function AppSidebar({ collapsed }: { collapsed?: boolean }) {
  const { user, logout } = useAuth()
  const { unreadCount } = useUI()
  const navigate = useNavigate()
  const extraLinks = user?.role ? roleLinks[user.role] ?? [] : []

  return (
    <aside className={cn(
      'fixed left-0 top-0 hidden h-full bg-sidebar border-r border-border z-40 md:flex flex-col transition-all',
      collapsed ? 'w-[72px]' : 'w-[280px]',
    )}>
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
        <img src={logo} alt="EchoSpot" className="h-8 w-8 rounded-full shrink-0" />
        {!collapsed && <span className="ml-2 font-heading font-semibold text-text-primary">EchoSpot</span>}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2 space-y-0.5">
        {[...appLinks, ...extraLinks].map((link) => (
          <NavLink
            key={link.to + link.label}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised',
              )
            }
            title={collapsed ? link.label : undefined}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {!collapsed && link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2 space-y-0.5 shrink-0">
        <NavLink
          to="/notifications"
          className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm relative transition-colors', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised')}
        >
          <Bell className="h-5 w-5 shrink-0" />
          {!collapsed && 'Notifications'}
          {unreadCount > 0 && <span className="absolute top-2 left-6 h-2 w-2 bg-echo-green rounded-full" />}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised')}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && 'Settings'}
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised')}
        >
          <User className="h-5 w-5 shrink-0" />
          {!collapsed && 'Profile'}
        </NavLink>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-error hover:bg-raised transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && 'Logout'}
        </button>
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mt-2">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-text-muted">Level {user.level}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export function MobileAppMenu() {
  const { user, logout } = useAuth()
  const { mobileMenuOpen, setMobileMenuOpen, unreadCount } = useUI()
  const navigate = useNavigate()
  const extraLinks = user?.role ? roleLinks[user.role] ?? [] : []
  const closeMenu = () => setMobileMenuOpen(false)

  if (!mobileMenuOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        className="absolute inset-0 h-full w-full bg-canvas/80 backdrop-blur-sm"
        aria-label="Close navigation menu"
        onClick={closeMenu}
      />
      <aside
        id="mobile-app-menu"
        className="relative h-full w-[min(280px,calc(100vw-3rem))] bg-sidebar border-r border-border shadow-elevated flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Application navigation"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <img src={logo} alt="EchoSpot" className="h-8 w-8 rounded-full" />
            <span className="font-heading font-semibold text-text-primary">EchoSpot</span>
          </div>
          <button onClick={closeMenu} className="p-2 text-text-muted hover:text-text-primary" aria-label="Close navigation menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
          {[...appLinks, ...extraLinks].map((link) => (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised')}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-2 space-y-0.5 shrink-0">
          <NavLink to="/notifications" onClick={closeMenu} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm relative transition-colors', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised')}>
            <Bell className="h-5 w-5" /> Notifications
            {unreadCount > 0 && <span aria-hidden="true" className="absolute top-2 left-6 h-2 w-2 bg-echo-green rounded-full" />}
          </NavLink>
          <NavLink to="/settings" onClick={closeMenu} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised')}><Settings className="h-5 w-5" /> Settings</NavLink>
          <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', isActive ? 'text-echo-green bg-echo-green/10' : 'text-text-muted hover:text-text-primary hover:bg-raised')}><User className="h-5 w-5" /> Profile</NavLink>
          <button onClick={() => { logout(); closeMenu(); navigate('/') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-error hover:bg-raised transition-colors"><LogOut className="h-5 w-5" /> Logout</button>
          {user && <div className="flex items-center gap-3 px-3 py-3 mt-2"><Avatar src={user.avatar} name={user.name} size="sm" /><div className="min-w-0"><p className="text-sm text-text-primary truncate">{user.name}</p><p className="text-xs text-text-muted">Level {user.level}</p></div></div>}
        </div>
      </aside>
    </div>
  )
}

export function MobileBottomNav() {
  const links = [
    { to: '/dashboard/contributor', icon: LayoutDashboard, label: 'Home' },
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/research', icon: BookOpen, label: 'Research' },
    { to: '/rewards', icon: Gift, label: 'Rewards' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-sidebar border-t border-border z-40 md:hidden">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 px-3 py-1 text-xs', isActive ? 'text-echo-green' : 'text-text-muted')
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function DashboardHeader() {
  const { setSearchOpen, setMobileMenuOpen, mobileMenuOpen } = useUI()

  return (
    <header className="h-16 border-b border-border bg-sidebar/80 glass-nav flex items-center justify-between px-4 sm:px-6 shrink-0">
      <button
        className="md:hidden p-2 text-text-muted"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
        aria-controls="mobile-app-menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <button
        onClick={() => setSearchOpen(true)}
        aria-label="Search projects, research, and contributors"
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-raised border border-border text-sm text-text-muted hover:border-border-strong transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline text-xs bg-canvas px-1 rounded border border-border">⌘K</kbd>
      </button>
    </header>
  )
}
