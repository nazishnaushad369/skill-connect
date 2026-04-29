import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import Dashboard      from './pages/Dashboard'
import SkillBrowser   from './pages/SkillBrowser'
import MatchesPage    from './pages/MatchesPage'
import MessagesPage   from './pages/MessagesPage'
import ChatPage       from './pages/ChatPage'
import SessionsPage   from './pages/SessionsPage'
import ProfilePage    from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import PricingPage    from './pages/PricingPage'
import PaymentPage    from './pages/PaymentPage'
import LeaderboardPage from './pages/LeaderboardPage'
import PremiumGate    from './components/PremiumGate'

function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  if (userOnly && user.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

function PremiumRoute({ children, featureName }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.is_premium) return children
  // Non-premium: show gate with sidebar from their own page shell
  return <PremiumGate user={user} featureName={featureName} />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                 element={<LandingPage />} />
      <Route path="/login"            element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"         element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password"  element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/pricing"          element={<ProtectedRoute userOnly><PricingPage /></ProtectedRoute>} />
      <Route path="/payment"          element={<ProtectedRoute userOnly><PaymentPage /></ProtectedRoute>} />

      <Route path="/dashboard"        element={<ProtectedRoute userOnly><Dashboard /></ProtectedRoute>} />
      <Route path="/skills"           element={<ProtectedRoute userOnly><SkillBrowser /></ProtectedRoute>} />
      <Route path="/matches"          element={<ProtectedRoute userOnly><MatchesPage /></ProtectedRoute>} />
      <Route path="/leaderboard"      element={<ProtectedRoute userOnly><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/profile/:id"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin"            element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

      {/* Premium-gated routes */}
      <Route path="/messages"         element={<PremiumRoute featureName="Messaging &amp; Chat"><MessagesPage /></PremiumRoute>} />
      <Route path="/messages/:userId" element={<PremiumRoute featureName="Messaging &amp; Chat"><ChatPage /></PremiumRoute>} />
      <Route path="/sessions"         element={<PremiumRoute featureName="Session Scheduling"><SessionsPage /></PremiumRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E2E8F0',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#FFFFFF' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
        }}
      />
      <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
