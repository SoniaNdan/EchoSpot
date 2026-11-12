import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import HomePage from '@/pages/Home/HomePage'
import DiscoverPage from '@/pages/Discover/DiscoverPage'
import ProjectDetailPage from '@/pages/Projects/ProjectDetailPage'
import ResearchPage from '@/pages/Research/ResearchPage'
import ResearchDetailPage from '@/pages/Research/ResearchDetailPage'
import EchoCheckPage from '@/pages/EchoCheck/EchoCheckPage'
import { LoadingState } from '@/components/ui/Progress'
import {
  AboutPage, AuthPage, ContributorProfilePage, ContributorsPage, FounderApplicationPage,
  LeaderboardsPage, NotificationsPage, ProfilePage, SettingsPage, SimplePage,
} from '@/pages/SharedPages'

const ContributorDashboardPage = lazy(() => import('@/pages/Contributor/ContributorDashboardPage'))
const FounderConsolePage = lazy(() => import('@/pages/Founder/FounderConsolePage'))
const AdminConsolePage = lazy(() => import('@/pages/Admin/AdminConsolePage'))
const RewardsPage = lazy(() => import('@/pages/Rewards/RewardsPage'))

function DashboardPageLoader() {
  return <LoadingState message="Loading workspace..." />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="projects/:slug/echocheck" element={<EchoCheckPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="research/:slug" element={<ResearchDetailPage />} />
        <Route path="echocheck" element={<EchoCheckPage />} />
        <Route path="contributors" element={<ContributorsPage />} />
        <Route path="contributors/:id" element={<ContributorProfilePage />} />
        <Route path="leaderboards" element={<LeaderboardsPage />} />
        <Route path="submit-project" element={<FounderApplicationPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<SimplePage title="Page not found" description="The page you requested does not exist." action="Return home" href="/" />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="forgot-password" element={<AuthPage mode="forgot" />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="dashboard/contributor" element={<Suspense fallback={<DashboardPageLoader />}><ContributorDashboardPage /></Suspense>} />
        <Route path="founder" element={<Suspense fallback={<DashboardPageLoader />}><FounderConsolePage /></Suspense>} />
        <Route path="admin" element={<Suspense fallback={<DashboardPageLoader />}><AdminConsolePage /></Suspense>} />
        <Route path="rewards" element={<Suspense fallback={<DashboardPageLoader />}><RewardsPage /></Suspense>} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="/dashboard" element={<Navigate to="/dashboard/contributor" replace />} />
    </Routes>
  )
}
