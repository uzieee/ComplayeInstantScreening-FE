import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, Search, AlertTriangle, CheckCircle, LogIn, FileText, Users } from 'lucide-react'
import { auditApi } from '@/services/api'
import { cn } from '@/utils/cn'
import { format, parseISO } from 'date-fns'

const ACTION_CFG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  screening:        { icon: Search,       color: 'text-blue-600',   bg: 'bg-blue-50' },
  batch_screening:  { icon: Shield,       color: 'text-purple-600', bg: 'bg-purple-50' },
  login:            { icon: LogIn,        color: 'text-gray-600',   bg: 'bg-gray-100' },
  report_generated: { icon: FileText,     color: 'text-green-600',  bg: 'bg-green-50' },
  report_downloaded:{ icon: FileText,     color: 'text-teal-600',   bg: 'bg-teal-50' },
  user_created:     { icon: Users,        color: 'text-indigo-600', bg: 'bg-indigo-50' },
}

const RESULT_CFG: Record<string, { label: string; color: string }> = {
  hit:           { label: 'Hit',     color: 'text-red-600' },
  possible_match:{ label: 'Possible',color: 'text-amber-600' },
  clear:         { label: 'Clear',   color: 'text-green-600' },
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [filterAction, setFilterAction] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, filterAction],
    queryFn: async () => {
      const r = await auditApi.list(page, filterAction || undefined)
      return r.data
    },
  })

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 1

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">Immutable record of all actions performed by your organisation</p>
        </div>
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1) }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F75835]/20 focus:border-[#F75835]">
          <option value="">All actions</option>
          <option value="screening">Screening</option>
          <option value="batch_screening">Batch</option>
          <option value="login">Login</option>
          <option value="report_generated">Report</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[32px_1fr_120px_80px_100px_140px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span/>
          <span>Entity / Action</span>
          <span>Action</span>
          <span>Result</span>
          <span>User</span>
          <span>Timestamp</span>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-[#F75835]/20 border-t-[#F75835] animate-spin" />
          </div>
        )}

        {!isLoading && data?.items?.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No audit records found</div>
        )}

        <div className="divide-y divide-gray-50">
          {data?.items?.map((log: any) => {
            const acfg = ACTION_CFG[log.action] || { icon: Shield, color: 'text-gray-500', bg: 'bg-gray-100' }
            const Icon = acfg.icon
            const rcfg = RESULT_CFG[log.result] || null
            return (
              <div key={log.id} className="grid grid-cols-[32px_1fr_120px_80px_100px_140px] gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center', acfg.bg)}>
                  <Icon size={13} className={acfg.color} />
                </span>
                <span className="font-medium text-sm text-gray-900 truncate">{log.entity}</span>
                <span className="text-xs text-gray-500 capitalize">{log.action.replace(/_/g, ' ')}</span>
                <span className={cn('text-xs font-semibold', rcfg?.color || 'text-gray-400')}>
                  {rcfg?.label || '—'}
                </span>
                <span className="text-xs text-gray-500 truncate">{log.user}</span>
                <span className="text-xs text-gray-400">
                  {log.timestamp ? format(parseISO(log.timestamp), 'd MMM HH:mm:ss') : '—'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {data?.total} total records
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                Previous
              </button>
              <span className="text-xs text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
