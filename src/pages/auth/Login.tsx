import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { AuthShell } from '@/components/auth/AuthShell'
import { authApi, extractError } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const emailVal = watch('email')
  const passwordVal = watch('password')

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data.email, data.password)
      const payload = res.data
      if (payload.requires_2fa) {
        navigate('/2fa', { state: { temp_token: payload.temp_token } })
        return
      }
      // Store token first so Authorization header is present on the /me call
      useAuthStore.getState().setAuth(
        { id: '', email: data.email, full_name: '', role: 'analyst', tenant_id: '', tenant_name: '', is_active: true, two_factor_enabled: false, created_at: '' },
        payload.access_token,
      )
      const meRes = await authApi.me()
      setAuth(meRes.data, payload.access_token)
      toast.success(`Welcome back, ${meRes.data.full_name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  return (
    <AuthShell>
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="leading-tight text-gray-900"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 38,
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.5px',
            }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
            Sign in to your screening workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <FloatField label="Email address" hasValue={!!emailVal} error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              className="peer w-full bg-transparent pt-5 pb-2 px-4 text-sm text-gray-900 outline-none"
              {...register('email')}
            />
          </FloatField>

          <FloatField
            label="Password"
            hasValue={!!passwordVal}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((s) => !s)}
                className="pr-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          >
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="peer w-full bg-transparent pt-5 pb-2 px-4 text-sm text-gray-900 outline-none"
              {...register('password')}
            />
          </FloatField>

          {/* Remember + forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#F75835]" />
              <span className="text-sm text-gray-500">Stay signed in</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium transition-colors"
              style={{ color: '#F75835' }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full mt-1 h-12 rounded-xl text-white text-sm font-semibold
                       overflow-hidden transition-all duration-200 active:scale-[0.99]
                       disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: '#F75835',
              boxShadow: '0 4px 24px rgba(232,93,38,0.30)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 32px rgba(232,93,38,0.42)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(232,93,38,0.30)')}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
            <span className="relative flex items-center justify-center gap-2">
              {isSubmitting ? (
                <><BtnSpinner /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </span>
          </button>
        </form>

        {/* Sign up */}
        <p className="mt-8 text-sm text-gray-400 text-center">
          No account?{' '}
          <Link
            to="/register"
            className="font-semibold text-gray-900 hover:text-[#F75835] transition-colors"
          >
            Request access →
          </Link>
        </p>

        {/* Trust strip */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-center text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-300 mb-3">
            Powered by official feeds from
          </p>
          <div className="flex items-center justify-center gap-5">
            {['OFAC', 'EU', 'UN', 'OFSI', 'SECO'].map((tag) => (
              <span key={tag} className="text-[11px] font-semibold text-gray-300 tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </AuthShell>
  )
}

/* ── Floating label field ── */
function FloatField({
  label,
  hasValue,
  error,
  rightElement,
  children,
}: {
  label: string
  hasValue: boolean
  error?: string
  rightElement?: React.ReactNode
  children: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const raised = focused || hasValue

  return (
    <div onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
      <div
        className="relative flex items-center rounded-xl transition-all duration-150"
        style={{
          background: focused ? '#fff' : '#EBEBEB',
          border: `1.5px solid ${error ? '#F87171' : focused ? '#F75835' : 'transparent'}`,
          boxShadow: focused ? '0 0 0 3px rgba(232,93,38,0.10)' : 'none',
        }}
      >
        <label
          className="absolute left-4 pointer-events-none select-none transition-all duration-150"
          style={{
            top: raised ? 8 : '50%',
            transform: raised ? 'none' : 'translateY(-50%)',
            fontSize: raised ? 10 : 14,
            fontWeight: raised ? 600 : 400,
            letterSpacing: raised ? '0.1em' : 'normal',
            textTransform: raised ? 'uppercase' : 'none',
            color: raised ? '#F75835' : '#9CA3AF',
          }}
        >
          {label}
        </label>
        <div className="flex-1">{children}</div>
        {rightElement && <div className="shrink-0 flex items-center">{rightElement}</div>}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 pl-1 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function BtnSpinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M14 8a6 6 0 00-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
