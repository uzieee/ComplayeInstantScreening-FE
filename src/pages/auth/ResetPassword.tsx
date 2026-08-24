import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authApi } from '../../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!token) {
      toast.error('Invalid reset link — please request a new one')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Invalid or expired link. Please request a new one.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg leading-tight">COMPLAYE</div>
              <div className="text-orange-400 text-xs font-semibold tracking-widest">INSTANT SCREENING</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password reset!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been updated. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#203864] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Set new password</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your new password below.</p>

              {!token && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  This reset link is invalid or incomplete. Please request a new one.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-[#F75835] text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                <button onClick={() => navigate('/login')} className="text-[#203864] font-medium hover:underline">
                  Back to login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
