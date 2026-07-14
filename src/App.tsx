import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PageSpinner } from '@/components/ui/Spinner'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

// Auth
const LoginPage          = lazy(() => import('@/pages/auth/Login'))
const RegisterPage       = lazy(() => import('@/pages/auth/Register'))
const TwoFactorPage      = lazy(() => import('@/pages/auth/TwoFactor'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPassword'))

// App
const DashboardPage        = lazy(() => import('@/pages/dashboard/Dashboard'))
const ScreeningPage        = lazy(() => import('@/pages/screening/Screening'))
const ScreeningHistoryPage = lazy(() => import('@/pages/screening/ScreeningHistory'))
const AuditLogPage         = lazy(() => import('@/pages/audit/AuditLog'))
const SettingsPage         = lazy(() => import('@/pages/settings/Settings'))
const AnalyticsPage        = lazy(() => import('@/pages/analytics/Analytics'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/2fa"              element={<TwoFactorPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

          {/* Protected app */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"          element={<DashboardPage />} />
              <Route path="/screening"          element={<ScreeningPage />} />
              <Route path="/screening/history"  element={<ScreeningHistoryPage />} />
              <Route path="/audit"              element={<AuditLogPage />} />
              <Route path="/settings"           element={<SettingsPage />} />

              {/* Placeholders for next phase */}
              <Route path="/reports"            element={<ComingSoon title="Reports" desc="Generate and download compliance reports for your screening sessions." />} />
              <Route path="/analytics"          element={<AnalyticsPage />} />
              <Route path="/admin/users"        element={<ComingSoon title="User Management" desc="Invite team members and manage roles." />} />
              <Route path="/admin/tenants"      element={<ComingSoon title="Tenant Management" desc="Manage client organisations (super admin only)." />} />
            </Route>
          </Route>

          <Route path="/"   element={<Navigate to="/dashboard" replace />} />
          <Route path="*"   element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function ComingSoon({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#203864]/8 flex items-center justify-center mb-4">
        <span className="text-2xl">🚀</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-xs">{desc || 'Coming in the next release.'}</p>
    </div>
  )
}

export default App
