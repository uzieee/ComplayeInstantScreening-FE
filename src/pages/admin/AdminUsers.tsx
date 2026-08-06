import { useEffect, useState } from 'react'
import { Users, Plus, Pencil, Trash2, ShieldCheck, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi, extractError } from '@/services/api'
import { cn } from '@/utils/cn'

const ROLES = ['analyst', 'tenant_admin', 'super_admin']
const ROLE_COLOR: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  tenant_admin: 'bg-blue-100 text-blue-700',
  analyst: 'bg-gray-100 text-gray-600',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'create' | { user: any }>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [u, t] = await Promise.all([adminApi.listUsers(), adminApi.listTenants()])
      setUsers(u.data)
      setTenants(t.data)
    } catch (err) { toast.error(extractError(err)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      await adminApi.deleteUser(id)
      toast.success('User deleted')
      load()
    } catch (err) { toast.error(extractError(err)) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">All users across all tenants</p>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#203864] text-white text-sm font-semibold hover:bg-[#162848] transition-colors cursor-pointer">
          <Plus size={15} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-[1fr_160px_140px_100px_80px_80px] px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>User</span><span>Tenant</span><span>Role</span><span>Status</span><span>2FA</span><span></span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No users found</div>
        ) : users.map(u => (
          <div key={u.id} className="border-b border-gray-50 last:border-0">
            {/* Desktop row */}
            <div className="hidden md:grid grid-cols-[1fr_160px_140px_100px_80px_80px] px-5 py-3.5 items-center hover:bg-gray-50/50">
              <div>
                <p className="text-sm font-semibold text-gray-900">{u.full_name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <span className="text-xs text-gray-600 truncate">{u.tenant_name}</span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full w-fit', ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600')}>
                {u.role}
              </span>
              <span className={cn('text-xs font-semibold', u.is_active ? 'text-green-600' : 'text-red-500')}>
                {u.is_active ? 'Active' : 'Suspended'}
              </span>
              <span>{u.two_factor_enabled ? <ShieldCheck size={15} className="text-green-500" /> : <span className="text-xs text-gray-300">—</span>}</span>
              <div className="flex gap-1 justify-end">
                <button onClick={() => setModal({ user: u })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"><Pencil size={13} /></button>
                <button onClick={() => deleteUser(u.id, u.full_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={13} /></button>
              </div>
            </div>
            {/* Mobile card */}
            <div className="md:hidden p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">{u.full_name}</span>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600')}>{u.role}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                <p className="text-xs text-gray-500 mt-0.5">{u.tenant_name}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setModal({ user: u })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><Pencil size={13} /></button>
                <button onClick={() => deleteUser(u.id, u.full_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <UserModal
          mode={modal === 'create' ? 'create' : 'edit'}
          user={modal === 'create' ? null : (modal as any).user}
          tenants={tenants}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

function UserModal({ mode, user, tenants, onClose, onSaved }: {
  mode: 'create' | 'edit'
  user: any | null
  tenants: any[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'analyst',
    tenant_id: user?.tenant_id || (tenants[0]?.id || ''),
    is_active: user?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      if (mode === 'create') {
        await adminApi.createUser(form)
        toast.success('User created')
      } else {
        const payload: any = { full_name: form.full_name, role: form.role, is_active: form.is_active }
        if (form.password) payload.password = form.password
        await adminApi.updateUser(user.id, payload)
        toast.success('User updated')
      }
      onSaved()
    } catch (err) { toast.error(extractError(err)) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">{mode === 'create' ? 'Add User' : 'Edit User'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <Field label="Full Name">
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)} className="input" />
          </Field>

          {mode === 'create' && (
            <Field label="Email">
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" />
            </Field>
          )}

          <Field label={mode === 'create' ? 'Password' : 'New Password (leave blank to keep)'}>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className="input pr-9" />
              <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>

          <Field label="Role">
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          {mode === 'create' && (
            <Field label="Tenant">
              <select value={form.tenant_id} onChange={e => set('tenant_id', e.target.value)} className="input">
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          )}

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 rounded accent-[#203864]" />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}
