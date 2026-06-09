import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Upload, ChevronDown, AlertTriangle, CheckCircle, Clock, ShieldAlert, Download, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { screeningApi, extractError } from '@/services/api'
import { cn } from '@/utils/cn'

const schema = z.object({
  name: z.string().min(2, 'Enter at least 2 characters'),
  entity_type: z.string().optional(),
  country: z.string().optional(),
  date_of_birth: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const SOURCES = ['OFAC', 'EU', 'UN', 'UK']

const RESULT_CFG = {
  hit:           { label: 'Hit',            color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    icon: AlertTriangle },
  possible_match:{ label: 'Possible Match', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: ShieldAlert },
  clear:         { label: 'Clear',          color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle },
}

export default function ScreeningPage() {
  const [tab, setTab] = useState<'single' | 'batch'>('single')
  const [sources, setSources] = useState<string[]>(SOURCES)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [batchResult, setBatchResult] = useState<any>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onScreen = async (data: FormData) => {
    if (sources.length === 0) { toast.error('Select at least one source'); return }
    setLoading(true); setResult(null)
    try {
      const res = await screeningApi.screen({ ...data, sources })
      setResult(res.data)
    } catch (err) { toast.error(extractError(err)) }
    finally { setLoading(false) }
  }

  const onBatch = async () => {
    if (!batchFile) { toast.error('Select a CSV file first'); return }
    setLoading(true); setBatchResult(null)
    try {
      const res = await screeningApi.batch(batchFile)
      setBatchResult(res.data)
      toast.success(`Screened ${res.data.total} entities`)
    } catch (err) { toast.error(extractError(err)) }
    finally { setLoading(false) }
  }

  const downloadReport = async (sessionId: string) => {
    try {
      const res = await screeningApi.downloadReport(sessionId)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url
      a.download = `CIS_Report_${sessionId.slice(0, 8)}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Failed to download report') }
  }

  const toggleSource = (s: string) =>
    setSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Instant Screening</h2>
          <p className="text-sm text-gray-500 mt-0.5">Screen entities against global sanctions lists in real-time</p>
        </div>
        <Link to="/screening/history" className="flex items-center gap-2 text-sm font-medium text-[#203864] hover:text-[#F75835] transition-colors">
          <History size={16} /> View history
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['single', 'batch'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {t === 'single' ? 'Single Entity' : 'Batch Upload'}
          </button>
        ))}
      </div>

      {tab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search size={16} className="text-[#F75835]" /> Search Parameters
              </h3>
              <form onSubmit={handleSubmit(onScreen)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Entity Name *</label>
                  <input {...register('name')} placeholder="e.g. MAERSK LINE LTD"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F75835]/20 focus:border-[#F75835] transition-all" />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Entity Type</label>
                  <div className="relative">
                    <select {...register('entity_type')} className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-9 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F75835]/20 focus:border-[#F75835]">
                      <option value="">Any</option>
                      <option value="individual">Individual</option>
                      <option value="entity">Entity / Company</option>
                      <option value="vessel">Vessel</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nationality / Country</label>
                  <input {...register('country')} placeholder="e.g. RU, IR, KP"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F75835]/20 focus:border-[#F75835] transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input {...register('date_of_birth')} placeholder="YYYY-MM-DD"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F75835]/20 focus:border-[#F75835] transition-all" />
                </div>

                {/* Sources */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sanctions Lists</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOURCES.map(s => (
                      <button key={s} type="button" onClick={() => toggleSource(s)}
                        className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
                          sources.includes(s)
                            ? 'bg-[#203864] border-[#203864] text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', sources.includes(s) ? 'bg-[#F75835]' : 'bg-gray-300')} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#F75835] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#e04a28] transition-colors disabled:opacity-60 shadow-lg shadow-[#F75835]/20">
                  {loading ? <><Spinner /> Screening…</> : <><Search size={15} /> Screen Now</>}
                </button>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!result && !loading && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-[#203864]/8 flex items-center justify-center mb-4">
                  <Search size={24} className="text-[#203864]/40" />
                </div>
                <p className="text-gray-500 text-sm">Enter an entity name and click <strong>Screen Now</strong></p>
                <p className="text-gray-400 text-xs mt-1">Results will appear here</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card h-full flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 rounded-full border-4 border-[#F75835]/20 border-t-[#F75835] animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Screening against {sources.join(', ')}…</p>
              </div>
            )}

            {result && !loading && <ScreeningResults result={result} onDownload={downloadReport} />}
          </div>
        </div>
      ) : (
        /* Batch */
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Batch Screening</h3>
            <p className="text-sm text-gray-500 mb-5">Upload a CSV with a <code className="bg-gray-100 px-1 rounded text-xs">name</code> column. Optional: <code className="bg-gray-100 px-1 rounded text-xs">country</code>, <code className="bg-gray-100 px-1 rounded text-xs">type</code></p>

            <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#F75835]/50 hover:bg-orange-50/30 transition-all">
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">{batchFile ? batchFile.name : 'Click to upload CSV'}</p>
              <p className="text-xs text-gray-400 mt-1">.csv files only</p>
              <input type="file" accept=".csv" className="hidden" onChange={e => setBatchFile(e.target.files?.[0] || null)} />
            </label>

            <button onClick={onBatch} disabled={loading || !batchFile}
              className="w-full mt-4 h-11 rounded-xl bg-[#F75835] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#e04a28] transition-colors disabled:opacity-60">
              {loading ? <><Spinner /> Processing…</> : <><Upload size={15} /> Run Batch Screening</>}
            </button>
          </div>

          {batchResult && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Batch Results — {batchResult.total} entities screened</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {batchResult.sessions?.map((s: any) => {
                  const cfg = RESULT_CFG[s.overall_result as keyof typeof RESULT_CFG] || RESULT_CFG.clear
                  const Icon = cfg.icon
                  return (
                    <div key={s.session_id} className={cn('flex items-center gap-3 p-3 rounded-xl border', cfg.bg, cfg.border)}>
                      <Icon size={16} className={cfg.color} />
                      <span className="flex-1 text-sm font-medium text-gray-900 truncate">{s.query_name}</span>
                      <span className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</span>
                      <button onClick={() => downloadReport(s.session_id)} className="text-gray-400 hover:text-[#F75835]">
                        <Download size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScreeningResults({ result, onDownload }: { result: any; onDownload: (id: string) => void }) {
  const cfg = RESULT_CFG[result.overall_result as keyof typeof RESULT_CFG] || RESULT_CFG.clear
  const Icon = cfg.icon

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className={cn('rounded-2xl border p-5', cfg.bg, cfg.border)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', cfg.bg, 'border', cfg.border)}>
              <Icon size={20} className={cfg.color} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{result.query_name}</p>
              <p className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</p>
            </div>
          </div>
          <button onClick={() => onDownload(result.session_id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#203864] text-white text-xs font-semibold hover:bg-[#162848] transition-colors">
            <Download size={13} /> Download Report
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-current border-opacity-10">
          {[
            { label: 'Sources checked', value: result.sources_checked?.join(', ') || '—' },
            { label: 'Hits', value: result.hit_count },
            { label: 'Possible matches', value: result.possible_count },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Matches */}
      {result.results?.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Matched Entities ({result.results.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {result.results.map((r: any) => {
              const rc = RESULT_CFG[r.result as keyof typeof RESULT_CFG] || RESULT_CFG.clear
              const RI = rc.icon
              return (
                <div key={r.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={cn('mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0', rc.bg)}>
                      <RI size={15} className={rc.color} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900">{r.name}</span>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', rc.bg, rc.color)}>{rc.label}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{r.source}</span>
                        <span className="text-xs text-gray-400">Score: {r.score}%</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        {r.type && <span className="text-xs text-gray-500 capitalize">{r.type}</span>}
                        {r.country && <span className="text-xs text-gray-500">🌍 {r.country}</span>}
                        {r.program && <span className="text-xs text-gray-500 truncate max-w-xs">{r.program}</span>}
                      </div>
                      {r.detail?.aliases?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">Also known as: {r.detail.aliases.slice(0, 3).join(', ')}</p>
                      )}
                    </div>
                    {/* Score bar */}
                    <div className="shrink-0 text-right">
                      <p className={cn('text-lg font-bold', rc.color)}>{r.score}%</p>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                        <div className={cn('h-full rounded-full', r.score >= 88 ? 'bg-red-500' : r.score >= 72 ? 'bg-amber-400' : 'bg-green-400')} style={{ width: `${r.score}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
          <CheckCircle size={32} className="mx-auto text-green-500 mb-3" />
          <p className="font-semibold text-gray-900">No matches found</p>
          <p className="text-sm text-gray-500 mt-1">This entity does not appear on any of the screened lists</p>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 00-6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
}
