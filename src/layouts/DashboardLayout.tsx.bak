import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar, DashboardHeader, MobileAppMenu, MobileBottomNav } from '@/components/navigation/AppSidebar'
import { CommandPalette, ToastContainer } from '@/components/navigation/SearchModal'

export function DashboardLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-canvas">
      <AppSidebar />
      <MobileAppMenu />
      <div className="md:ml-[280px] flex flex-col min-h-screen pb-16 md:pb-0">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <CommandPalette />
      <ToastContainer />
    </div>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <AppSidebar collapsed />
      <MobileAppMenu />
      <div className="md:ml-[72px] flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 max-w-[1280px]">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <ToastContainer />
    </div>
  )
}
