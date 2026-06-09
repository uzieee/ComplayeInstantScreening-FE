import { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

import { AuthShell } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/Button'
import { authApi, extractError } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

export default function TwoFactorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const temp_token = (location.state as { temp_token: string })?.temp_token

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join('')

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...digits]
    next[i] = val.slice(-1)
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return
    setLoading(true)
    try {
      const res = await authApi.verify2FA(temp_token, code)
      const meRes = await authApi.me()
      setAuth(meRes.data, res.data.access_token)
      toast.success('Verified! Welcome back.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(extractError(err))
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-brand/10 items-center justify-center mb-5">
          <ShieldCheck size={28} className="text-brand" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Two-factor authentication</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={onSubmit} className="mt-8">
          <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-14 rounded-xl border-2 border-gray-200 text-center text-xl font-bold text-gray-900
                           focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full mt-8"
            size="lg"
            loading={loading}
            disabled={code.length !== 6}
          >
            Verify
          </Button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Lost access?{' '}
          <button className="text-brand hover:text-brand-dark font-medium">
            Use a backup code
          </button>
        </p>
      </div>
    </AuthShell>
  )
}
