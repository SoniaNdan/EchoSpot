import { Outlet } from 'react-router-dom'
import { PublicNav, Footer } from '@/components/navigation/PublicNav'
import { CommandPalette, ToastContainer } from '@/components/navigation/SearchModal'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette />
      <ToastContainer />
    </div>
  )
}
