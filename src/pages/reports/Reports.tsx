import { useEffect, useState } from 'react'
import { Download, Mail, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { screeningApi, auditApi, reportsApi, extractError } from '@/services/api'
import { cn } from '@/utils/cn'

const RESULT_STYLE: Record<string, { icon: typeof CheckCircle; cls: string; label: string }> = {
  hit:           { icon: XCircle,       cls: 'text-red-600 bg-red-50',    label: 'HIT' },
  possible_match:{ icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50',label: 'POSSIBLE' },
  clear:         { icon: CheckCircle,   cls: 'text-green-600 bg-green-50',label: 'CLEAR' },
}

export default function ReportsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [emailTarget, setEmailTarget] = useState<string | null>(null)
  const [emailAddr, setEmailAddr] = useState('')
  const [sending, setSending] = useState(false)
  const [connectionReport, setConnectionReport] = useState<any>(null)
  const [tab, setTab] = useState<'screening' | 'connections'>('screening')

  useEffect(() => {
    loadSessions()
    loadConnectionReport()
  }, [])

  const loadSessions = async () => {
    try {
      const res = await screeningApi.history(1)
      setSessions(res.data.items || [])
    } catch (err) { toast.error(extractError(err)) }
    finally { setLoading(false) }
  }

  const loadConnectionReport = async () => {
    try {
      const res = await auditApi.connectionReport()
      setConnectionReport(res.data)
    } catch {}
  }

  const downloadPdf = async (id: string, name: string) => {
    try {
      const res = await screeningApi.downloadReport(id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `CIS_Report_${id.slice(0,8)}.pdf`; a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) { toast.error(extractError(err)) }
  }

  const sendEmail = async () => {
    if (!emailTarget || !emailAddr) return
    setSending(true)
    try {
      await reportsApi.emailReport(emailTarget, emailAddr)
      toast.success(`Report sent to ${emailAddr}`)
      setEmailTarget(null); setEmailAddr('')
    } catch (err) { toast.error(extractError(err)) }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reports & Audit</h2>
        <p className="text-sm text-gray-500 mt-0.5">Download or email compliance reports, view connection activity</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {(['screening', 'connections'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-colors cursor-pointer',
              tab === t ? 'border-[#203864] text-[#203864]' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}>
            {t === 'connections' ? 'Connection Report' : 'Screening Reports'}
          </button>
        ))}
      </div>

      {tab === 'screening' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_110px_80px_80px_auto] px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Entity</span><span>Date</span><span>Sources</span><span>Result</span><span></span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No screening sessions yet</div>
          ) : sessions.map(s => {
            const r = RESULT_STYLE[s.overall_result] || RESULT_STYLE.clear
            const Icon = r.icon
            return (
              <div key={s.session_id} className="border-b border-gray-50 last:border-0">
                <div className="hidden md:grid grid-cols-[1fr_110px_80px_80px_auto] px-5 py-3.5 items-center hover:bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-300 shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">{s.query_name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</span>
                  <span className="text-xs text-gray-500">{(s.sources_checked || []).length}</span>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full w-fit', r.cls)}>
                    <Icon size={10} className="inline mr-1" />{r.label}
                  </span>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => downloadPdf(s.session_id, s.query_name)}
                      title="Download PDF"
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#203864] cursor-pointer transition-colors">
                      <Download size={14} />
                    </button>
                    <button onClick={() => setEmailTarget(s.session_id)}
                      title="Email report"
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#203864] cursor-pointer transition-colors">
                      <Mail size={14} />
                    </button>
                  </div>
                </div>
                {/* Mobile */}
                <div className="md:hidden p-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.query_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', r.cls)}>{r.label}</span>
                      <span className="text-xs text-gray-400">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => downloadPdf(s.session_id, s.query_name)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><Download size={14} /></button>
                    <button onClick={() => setEmailTarget(s.session_id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><Mail size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'connections' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px] px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>User</span><span>Total Logins</span><span>First Login</span><span>Last Login</span>
          </div>
          {!connectionReport ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
          ) : (connectionReport.report || []).length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No login activity recorded</div>
          ) : (connectionReport.report || []).map((row: any) => (
            <div key={row.user_id} className="border-b border-gray-50 last:border-0">
              <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px] px-5 py-3.5 items-center hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row.user_name}</p>
                  <p className="text-xs text-gray-400">{row.user_email}</p>
                </div>
                <span className="text-sm font-bold text-[#203864]">{row.login_count}</span>
                <span className="text-xs text-gray-500">{row.first_login ? new Date(row.first_login).toLocaleDateString() : '—'}</span>
                <span className="text-xs text-gray-500">{row.last_login ? new Date(row.last_login).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Modal */}
      {emailTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Email Compliance Report</h3>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={emailAddr}
              onChange={e => setEmailAddr(e.target.value)}
              className="input w-full mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => { setEmailTarget(null); setEmailAddr('') }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={sendEmail} disabled={sending || !emailAddr}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#203864] text-white text-sm font-semibold hover:bg-[#162848] disabled:opacity-60 cursor-pointer transition-colors">
                {sending ? 'Sending…' : 'Send Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
