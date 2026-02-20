import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

// Layout
import Layout from './components/Layout'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import OTPLogin from './pages/OTPLogin'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import WellnessPlan from './pages/WellnessPlan'
import Habits from './pages/Habits'
import Challenges from './pages/Challenges'
import MindfulBreaks from './pages/MindfulBreaks'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  console.log('ProtectedRoute - loading:', loading, 'user:', user)

  if (loading) {
    console.log('ProtectedRoute - showing loading spinner')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute - user is null, redirecting to /login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - rendering children')
  return children
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp-login" element={<OTPLogin />} />

      {/* Protected Routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/wellness-plan" element={
        <ProtectedRoute>
          <Layout>
            <WellnessPlan />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/habits" element={
        <ProtectedRoute>
          <Layout>
            <Habits />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/challenges" element={
        <ProtectedRoute>
          <Layout>
            <Challenges />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/breaks" element={
        <ProtectedRoute>
          <Layout>
            <MindfulBreaks />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <Analytics />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/achievements" element={
        <ProtectedRoute>
          <Layout>
            <Achievements />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
