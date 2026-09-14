import { Outlet, Link } from 'react-router-dom'
import { CommandPalette, ToastContainer } from '@/components/navigation/SearchModal'
import logo from '@/assets/logo.png'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 border-r border-border">
        <div className="max-w-md">
          <img src={logo} alt="EchoSpot" className="h-16 w-16 rounded-full mb-6" />
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-4">
            Research. Verify. Explain. Amplify.
          </h1>
          <p className="text-text-muted">
            Join the Web3 discovery platform built for researchers, builders, and contributors who value transparency over hype.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={logo} alt="EchoSpot" className="h-8 w-8 rounded-full" />
            <span className="font-heading font-semibold text-text-primary">EchoSpot</span>
          </Link>
          <Outlet />
        </div>
      </div>
      <CommandPalette />
      <ToastContainer />
    </div>
  )
}
