import { useEffect, useState } from 'react'
import { Building2, Plus, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi, extractError } from '@/services/api'
import { cn } from '@/utils/cn'

const PLAN_COLOR: Record<string, string> = {
  enterprise: 'bg-purple-100 text-purple-700',
  professional: 'bg-blue-100 text-blue-700',
  basic: 'bg-gray-100 text-gray-600',
  trial: 'bg-amber-100 text-amber-700',
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'create' | { tenant: any }>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminApi.listTenants()
      setTenants(res.data)
    } catch (err) { toast.error(extractError(err)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tenant Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">All client organisations</p>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#203864] text-white text-sm font-semibold hover:bg-[#162848] transition-colors cursor-pointer">
          <Plus size={15} /> Add Tenant
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_80px_100px_120px_100px_80px_60px] px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Organisation</span><span>Country</span><span>Plan</span><span>Usage</span><span>Users</span><span>Status</span><span></span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No tenants found</div>
        ) : tenants.map(t => (
          <div key={t.id} className="border-b border-gray-50 last:border-0">
            {/* Desktop */}
            <div className="hidden md:grid grid-cols-[1fr_80px_100px_120px_100px_80px_60px] px-5 py-3.5 items-center hover:bg-gray-50/50">
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.slug}</p>
              </div>
              <span className="text-xs text-gray-600">{t.country || '—'}</span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full w-fit', PLAN_COLOR[t.plan] || 'bg-gray-100 text-gray-600')}>{t.plan}</span>
              <div>
                <p className="text-xs text-gray-700">{t.searches_used} / {t.search_quota}</p>
                <div className="w-20 h-1 bg-gray-100 rounded-full mt-1">
                  <div className="h-full bg-[#203864] rounded-full" style={{ width: `${Math.min(100, (t.searches_used / t.search_quota) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xs text-gray-600">{t.user_count} users</span>
              <span className={cn('text-xs font-semibold', t.is_active ? 'text-green-600' : 'text-red-500')}>{t.is_active ? 'Active' : 'Inactive'}</span>
              <button onClick={() => setModal({ tenant: t })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"><Pencil size={13} /></button>
            </div>
            {/* Mobile */}
            <div className="md:hidden p-4 flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">{t.name}</span>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', PLAN_COLOR[t.plan] || 'bg-gray-100')}>{t.plan}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{t.searches_used}/{t.search_quota} searches · {t.user_count} users</p>
              </div>
              <button onClick={() => setModal({ tenant: t })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><Pencil size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <TenantModal
          mode={modal === 'create' ? 'create' : 'edit'}
          tenant={modal === 'create' ? null : (modal as any).tenant}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

function TenantModal({ mode, tenant, onClose, onSaved }: { mode: 'create' | 'edit'; tenant: any | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: tenant?.name || '',
    country: tenant?.country || '',
    plan: tenant?.plan || 'trial',
    search_quota: tenant?.search_quota ?? 500,
    is_active: tenant?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      if (mode === 'create') { await adminApi.createTenant(form); toast.success('Tenant created') }
      else { await adminApi.updateTenant(tenant.id, form); toast.success('Tenant updated') }
      onSaved()
    } catch (err) { toast.error(extractError(err)) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">{mode === 'create' ? 'Add Tenant' : 'Edit Tenant'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          {['name', 'country'].map(k => (
            <div key={k}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{k}</label>
              <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="input" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Plan</label>
            <select value={form.plan} onChange={e => set('plan', e.target.value)} className="input">
              {['trial','basic','professional','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Search Quota</label>
            <input type="number" value={form.search_quota} onChange={e => set('search_quota', +e.target.value)} className="input" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 rounded accent-[#203864]" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-[#203864] text-white text-sm font-semibold hover:bg-[#162848] disabled:opacity-60 cursor-pointer transition-colors">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
