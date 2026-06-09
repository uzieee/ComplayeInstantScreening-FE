import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle, ShieldAlert, Download, ArrowLeft } from 'lucide-react'
import { screeningApi, extractError } from '@/services/api'
import { cn } from '@/utils/cn'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const RESULT_CFG = {
  hit:           { label: 'Hit',     color: 'text-red-600',   bg: 'bg-red-50',   icon: AlertTriangle },
  possible_match:{ label: 'Possible',color: 'text-amber-600', bg: 'bg-amber-50', icon: ShieldAlert },
  clear:         { label: 'Clear',   color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
}

export default function ScreeningHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['screening-history'],
    queryFn: async () => { const r = await screeningApi.history(); return r.data },
  })

  const download = async (id: string) => {
    try {
      const res = await screeningApi.downloadReport(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = `CIS_Report_${id.slice(0,8)}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Failed to download') }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/screening" className="text-gray-400 hover:text-gray-600 transition-colors"><ArrowLeft size={20} /></Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Screening History</h2>
          <p className="text-sm text-gray-500">All searches performed by your organisation</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_80px_120px_44px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Entity</span><span>Sources</span><span className="text-center">Hits</span><span>Date</span><span />
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-[#F75835]/20 border-t-[#F75835] animate-spin" />
          </div>
        )}

        {!isLoading && data?.items?.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No screenings yet</div>
        )}

        <div className="divide-y divide-gray-50">
          {data?.items?.map((item: any) => {
            const cfg = RESULT_CFG[item.overall_result as keyof typeof RESULT_CFG] || RESULT_CFG.clear
            const Icon = cfg.icon
            return (
              <div key={item.session_id} className="grid grid-cols-[1fr_100px_80px_120px_44px] gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon size={13} className={cfg.color} />
                  </span>
                  <span className="font-medium text-sm text-gray-900 truncate">{item.query_name}</span>
                </div>
                <span className="text-xs text-gray-500">{item.sources_checked?.join(', ')}</span>
                <div className="text-center">
                  {item.hit_count > 0
                    ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{item.hit_count} hit{item.hit_count > 1 ? 's' : ''}</span>
                    : item.possible_count > 0
                    ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{item.possible_count}</span>
                    : <span className="text-xs text-green-600">—</span>}
                </div>
                <span className="text-xs text-gray-400">{item.created_at ? format(parseISO(item.created_at), 'd MMM yyyy HH:mm') : '—'}</span>
                <button onClick={() => download(item.session_id)} className="text-gray-300 hover:text-[#F75835] transition-colors justify-self-center">
                  <Download size={15} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
