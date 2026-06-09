import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PageSpinner } from '@/components/ui/Spinner'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

const LoginPage         = lazy(() => import('@/pages/auth/Login'))
const RegisterPage      = lazy(() => import('@/pages/auth/Register'))
const TwoFactorPage     = lazy(() => import('@/pages/auth/TwoFactor'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPassword'))
const DashboardPage     = lazy(() => import('@/pages/dashboard/Dashboard'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/2fa"             element={<TwoFactorPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Placeholder routes — to be built next */}
              <Route path="/screening"       element={<ComingSoon title="Instant Screening" />} />
              <Route path="/reports"         element={<ComingSoon title="Reports" />} />
              <Route path="/audit"           element={<ComingSoon title="Audit Log" />} />
              <Route path="/analytics"       element={<ComingSoon title="Analytics" />} />
              <Route path="/settings"        element={<ComingSoon title="Settings" />} />
              <Route path="/admin/users"     element={<ComingSoon title="User Management" />} />
              <Route path="/admin/tenants"   element={<ComingSoon title="Tenant Management" />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-xs">
        This module is under development and will be available in the next release.
      </p>
    </div>
  )
}

export default App
