import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { AuthShell } from '@/components/auth/AuthShell'
import { authApi, extractError } from '@/services/api'

const COUNTRIES = [
  { value: '', label: 'Select your country' },
  { value: 'KE', label: 'Kenya' }, { value: 'NG', label: 'Nigeria' },
  { value: 'ZA', label: 'South Africa' }, { value: 'ET', label: 'Ethiopia' },
  { value: 'TZ', label: 'Tanzania' }, { value: 'UG', label: 'Uganda' },
  { value: 'GH', label: 'Ghana' }, { value: 'SN', label: 'Senegal' },
  { value: 'CI', label: "Côte d'Ivoire" }, { value: 'MZ', label: 'Mozambique' },
  { value: 'CM', label: 'Cameroon' }, { value: 'MA', label: 'Morocco' },
  { value: 'MU', label: 'Mauritius' }, { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' }, { value: 'BE', label: 'Belgium' },
  { value: 'US', label: 'United States' }, { value: 'OTHER', label: 'Other' },
]

const schema = z.object({
  full_name: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Enter a valid email'),
  company_name: z.string().min(2, 'Required'),
  country: z.string().min(1, 'Select your country'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Add an uppercase letter').regex(/[0-9]/, 'Add a number'),
  confirm_password: z.string(),
  accept_terms: z.boolean().refine((v) => v, 'Accept terms to continue'),
}).refine((d) => d.password === d.confirm_password, { message: "Passwords don't match", path: ['confirm_password'] })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const v = watch()

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({ email: data.email, password: data.password, full_name: data.full_name, company_name: data.company_name, country: data.country })
      toast.success('Account created! Check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  return (
    <AuthShell>
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Create account
          </h1>
          <p className="mt-1.5 text-sm text-gray-400">Start your 14-day free trial — no card required</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          <FloatField label="Full name" hasValue={!!v.full_name} error={errors.full_name?.message}>
            <input type="text" autoComplete="name" className="peer w-full bg-transparent pt-5 pb-2 px-4 text-sm text-gray-900 outline-none" {...register('full_name')} />
          </FloatField>

          <FloatField label="Work email" hasValue={!!v.email} error={errors.email?.message}>
            <input type="email" autoComplete="email" className="peer w-full bg-transparent pt-5 pb-2 px-4 text-sm text-gray-900 outline-none" {...register('email')} />
          </FloatField>

          <FloatField label="Company / Organisation" hasValue={!!v.company_name} error={errors.company_name?.message}>
            <input type="text" className="peer w-full bg-transparent pt-5 pb-2 px-4 text-sm text-gray-900 outline-none" {...register('company_name')} />
          </FloatField>

          {/* Country — native select with float-like treatment */}
          <div>
            <div className={`relative rounded-xl border bg-gray-50 transition-all duration-150 focus-within:bg-white focus-within:border-[#F75835] focus-within:ring-2 focus-within:ring-[#F75835]/10 ${errors.country ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}>
              <label className={`absolute left-4 pointer-events-none select-none transition-all duration-150 ${v.country ? 'top-2 text-[10px] font-semibold tracking-wider uppercase text-[#F75835]' : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'}`}>
                Country
              </label>
              <select
                className={`w-full bg-transparent px-4 pb-2 text-sm text-gray-900 outline-none appearance-none ${v.country ? 'pt-5' : 'pt-3.5 pb-3.5 opacity-0 focus:opacity-100'}`}
                {...register('country')}
              >
                {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {errors.country && <p className="mt-1.5 text-xs text-red-500 pl-1">{errors.country.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FloatField label="Password" hasValue={!!v.password} error={errors.password?.message}
              rightElement={<button type="button" tabIndex={-1} onClick={() => setShowPw(s => !s)} className="pr-3.5 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>}>
              <input type={showPw ? 'text' : 'password'} autoComplete="new-password" className="peer w-full bg-transparent pt-5 pb-2 px-4 text-sm text-gray-900 outline-none" {...register('password')} />
            </FloatField>

            <FloatField label="Confirm" hasValue={!!v.confirm_password} error={errors.confirm_password?.message}
              rightElement={<button type="button" tabIndex={-1} onClick={() => setShowCpw(s => !s)} className="pr-3.5 text-gray-400 hover:text-gray-600">{showCpw ? <EyeOff size={15} /> : <Eye size={15} />}</button>}>
              <input type={showCpw ? 'text' : 'password'} autoComplete="new-password" className="peer w-full bg-transparent pt-5 pb-2 px-4 text-sm text-gray-900 outline-none" {...register('confirm_password')} />
            </FloatField>
          </div>

          <label className="flex items-start gap-2.5 pt-0.5 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#F75835]" {...register('accept_terms')} />
            <span className="text-xs text-gray-500 leading-relaxed">
              I accept the{' '}
              <a href="#" className="text-gray-900 underline underline-offset-2 hover:text-[#F75835]">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-gray-900 underline underline-offset-2 hover:text-[#F75835]">Privacy Policy</a>
            </span>
          </label>
          {errors.accept_terms && <p className="text-xs text-red-500">{errors.accept_terms.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full mt-1 h-12 rounded-xl bg-[#F75835] text-white text-sm font-semibold
                       overflow-hidden transition-all duration-200 hover:bg-[#C94E1A] active:scale-[0.99]
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#F75835]/25
                       hover:shadow-xl hover:shadow-[#F75835]/30"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
            <span className="relative flex items-center justify-center gap-2">
              {isSubmitting ? <><Spinner /> Creating account…</> : <>Create account <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
            </span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 font-semibold hover:text-[#F75835] transition-colors">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  )
}

function FloatField({ label, hasValue, error, rightElement, children }: {
  label: string; hasValue: boolean; error?: string; rightElement?: React.ReactNode; children: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const raised = focused || hasValue
  return (
    <div onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
      <div className={`relative flex items-center rounded-xl border bg-gray-50 transition-all duration-150
        ${focused ? 'bg-white border-[#F75835] ring-2 ring-[#F75835]/10' : ''}
        ${error ? 'border-red-400 ring-2 ring-red-100' : !focused ? 'border-gray-200 hover:border-gray-300' : ''}`}>
        <label className={`absolute left-4 pointer-events-none select-none transition-all duration-150 ${raised ? 'top-2 text-[10px] font-semibold tracking-wider uppercase text-[#F75835]' : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'}`}>
          {label}
        </label>
        <div className="flex-1">{children}</div>
        {rightElement && <div className="shrink-0 flex items-center">{rightElement}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 pl-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block" />{error}</p>}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M14 8a6 6 0 00-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
