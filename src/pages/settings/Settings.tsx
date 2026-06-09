import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ShieldCheck, ShieldOff, User, Database, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, collectorApi, usersApi, extractError } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [tab, setTab] = useState<'profile' | 'security' | 'data'>('profile')
  const [collecting, setCollecting] = useState(false)
  const [collectorResult, setCollectorResult] = useState<any>(null)
  const [setup2FAData, setSetup2FAData] = useState<any>(null)
  const [twoFACode, setTwoFACode] = useState('')
  const [disableCode, setDisableCode] = useState('')

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { full_name: user?.full_name || '' },
  })

  const saveProfile = async (data: any) => {
    try {
      const res = await usersApi.updateMe(data)
      setUser({ ...user!, ...res.data })
      toast.success('Profile updated')
    } catch (err) { toast.error(extractError(err)) }
  }

  const start2FASetup = async () => {
    try {
      const res = await authApi.setup2FA()
      setSetup2FAData(res.data)
    } catch (err) { toast.error(extractError(err)) }
  }

  const confirm2FA = async () => {
    if (!setup2FAData || !twoFACode) return
    try {
      await authApi.confirm2FA(twoFACode, setup2FAData.secret)
      setUser({ ...user!, two_factor_enabled: true })
      setSetup2FAData(null); setTwoFACode('')
      toast.success('2FA enabled')
    } catch (err) { toast.error(extractError(err)) }
  }

  const disable2FA = async () => {
    if (!disableCode) return
    try {
      await authApi.disable2FA(disableCode)
      setUser({ ...user!, two_factor_enabled: false })
      setDisableCode('')
      toast.success('2FA disabled')
    } catch (err) { toast.error(extractError(err)) }
  }

  const runCollector = async () => {
    setCollecting(true); setCollectorResult(null)
    try {
      const res = await collectorApi.runSync()
      setCollectorResult(res.data)
      toast.success('Sanctions lists updated!')
    } catch (err) { toast.error(extractError(err)) }
    finally { setCollecting(false) }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and platform configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['profile', 'security', 'data'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><User size={16} className="text-[#F75835]" /> Profile</h3>
          <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input {...register('full_name')} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F75835]/20 focus:border-[#F75835]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input value={user?.email || ''} disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Organisation</label>
              <input value={user?.tenant_name || ''} disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
              <input value={user?.role?.replace('_', ' ') || ''} disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed capitalize" />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#F75835] text-white text-sm font-semibold hover:bg-[#e04a28] transition-colors disabled:opacity-60">
              Save changes
            </button>
          </form>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><ShieldCheck size={16} className="text-[#F75835]" /> Two-Factor Authentication</h3>

          {user?.two_factor_enabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <ShieldCheck size={20} className="text-green-600" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">2FA is enabled</p>
                  <p className="text-xs text-green-600">Your account is protected with an authenticator app</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Enter code to disable</label>
                <div className="flex gap-2">
                  <input value={disableCode} onChange={e => setDisableCode(e.target.value)} maxLength={6}
                    placeholder="000000" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400" />
                  <button onClick={disable2FA}
                    className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-2">
                    <ShieldOff size={15} /> Disable
                  </button>
                </div>
              </div>
            </div>
          ) : setup2FAData ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              <div className="flex justify-center">
                <img src={`data:image/png;base64,${setup2FAData.qr_image_base64}`} alt="QR Code" className="w-44 h-44 border border-gray-200 rounded-xl p-2" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-center break-all text-gray-600">{setup2FAData.secret}</div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Enter verification code</label>
                <div className="flex gap-2">
                  <input value={twoFACode} onChange={e => setTwoFACode(e.target.value)} maxLength={6} placeholder="000000"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F75835]/20 focus:border-[#F75835]" />
                  <button onClick={confirm2FA}
                    className="px-4 py-2.5 rounded-xl bg-[#F75835] text-white text-sm font-semibold hover:bg-[#e04a28] transition-colors">
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <ShieldOff size={20} className="text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">2FA is not enabled</p>
                  <p className="text-xs text-amber-600">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button onClick={start2FASetup}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#203864] text-white text-sm font-semibold hover:bg-[#162848] transition-colors">
                <ShieldCheck size={15} /> Enable 2FA
              </button>
            </div>
          )}
        </div>
      )}

      {/* Data tab */}
      {tab === 'data' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Database size={16} className="text-[#F75835]" /> Sanctions Data</h3>
          <p className="text-sm text-gray-500">Download and update the latest sanctions lists from official sources (OFAC, EU, UN, UK OFSI). This may take a few minutes.</p>

          <button onClick={runCollector} disabled={collecting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#203864] text-white text-sm font-semibold hover:bg-[#162848] transition-colors disabled:opacity-60">
            <RefreshCw size={15} className={collecting ? 'animate-spin' : ''} />
            {collecting ? 'Updating lists…' : 'Update Sanctions Lists Now'}
          </button>

          {collectorResult && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Collection Results</p>
              {Object.entries(collectorResult.results || {}).map(([source, res]: [string, any]) => (
                <div key={source} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">{source.toUpperCase()}</span>
                  <span className={cn('text-xs', res.error ? 'text-red-500' : 'text-green-600')}>
                    {res.error ? `Error: ${res.error}` : `${res.total || res.sdn || 0} entities`}
                  </span>
                </div>
              ))}
              {collectorResult.total_entities !== undefined && (
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm font-bold">
                  <span>Total in database</span>
                  <span className="text-[#203864]">{collectorResult.total_entities.toLocaleString()} entities</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
