import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import {
  TrendingUp, AlertTriangle, ShieldAlert, CheckCircle,
  BarChart2, Globe, Shield, Percent,
} from 'lucide-react'
import { api } from '@/services/api'
import { cn } from '@/utils/cn'

const PERIODS = [
  { label: '7 days',  value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

const SOURCE_COLORS: Record<string, string> = {
  OFAC: '#F75835',
  EU:   '#203864',
  UN:   '#0ea5e9',
  UK:   '#8b5cf6',
}

const RESULT_COLORS = {
  hits:     '#ef4444',
  possible: '#f59e0b',
  searches: '#F75835',
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const r = await api.get(`/dashboard/analytics?days=${period}`)
      return r.data
    },
    staleTime: 0,
  })

  if (isLoading || !data) {
    return (
      <div className="flex justify-center pt-24">
        <div className="w-8 h-8 rounded-full border-4 border-[#F75835]/20 border-t-[#F75835] animate-spin" />
      </div>
    )
  }

  const { summary, trend, source_breakdown, type_breakdown, top_countries } = data

  const pieData = [
    { name: 'Hits',     value: summary.total_hits,     color: '#ef4444' },
    { name: 'Possible', value: summary.total_possible, color: '#f59e0b' },
    { name: 'Clear',    value: summary.total_clear,    color: '#22c55e' },
  ].filter(d => d.value > 0)

  const maxCountry = top_countries[0]?.count || 1

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Screening performance and risk intelligence</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                period === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total screenings"
          value={summary.total_screens.toLocaleString()}
          icon={BarChart2}
          color="brand"
          sub={`Last ${period} days`}
        />
        <KpiCard
          label="Sanctions hits"
          value={summary.total_hits.toLocaleString()}
          icon={AlertTriangle}
          color="red"
          sub="Confirmed matches"
        />
        <KpiCard
          label="Pending review"
          value={summary.total_possible.toLocaleString()}
          icon={ShieldAlert}
          color="amber"
          sub="Possible matches"
        />
        <KpiCard
          label="Hit rate"
          value={`${summary.hit_rate}%`}
          icon={Percent}
          color="purple"
          sub="Hits / total screens"
        />
      </div>

      {/* Trend chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Screening trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Daily volume with hit and possible match overlay</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {[
              { color: '#F75835', label: 'Searches' },
              { color: '#ef4444', label: 'Hits' },
              { color: '#f59e0b', label: 'Possible' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded inline-block" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gSearches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F75835" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#F75835" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={v => format(parseISO(v), period <= 14 ? 'd MMM' : 'd MMM')}
                axisLine={false} tickLine={false}
                interval={period <= 14 ? 0 : Math.floor(period / 10)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                labelFormatter={v => format(parseISO(v as string), 'd MMMM yyyy')}
              />
              <Area type="monotone" dataKey="searches" stroke="#F75835" strokeWidth={2} fill="url(#gSearches)" dot={false} />
              <Area type="monotone" dataKey="hits"     stroke="#ef4444" strokeWidth={2} fill="none" dot={false} strokeDasharray="4 2" />
              <Area type="monotone" dataKey="possible" stroke="#f59e0b" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="2 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Result breakdown donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Result breakdown</h3>
          <p className="text-xs text-gray-400 mb-4">By screening outcome</p>
          {pieData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          ) : (
            <>
              <div style={{ width: '100%', height: 160 }} className="flex justify-center">
                <PieChart width={160} height={160}>
                  <Pie data={pieData} cx={75} cy={75} innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                </PieChart>
              </div>
              <ul className="space-y-2 mt-3">
                {pieData.map(d => (
                  <li key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </span>
                    <span className="font-semibold text-gray-900">{d.value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Source breakdown bar */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Hits by source list</h3>
          <p className="text-xs text-gray-400 mb-4">Matches per sanctions list</p>
          {source_breakdown.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          ) : (
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={source_breakdown} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {source_breakdown.map((e: any, i: number) => (
                      <Cell key={i} fill={SOURCE_COLORS[e.source] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Entity type */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Hit entity types</h3>
          <p className="text-xs text-gray-400 mb-4">Individual vs entity classification</p>
          {type_breakdown.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          ) : (
            <>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart width={140} height={140}>
                    <Pie data={type_breakdown.map((t: any) => ({ ...t, name: t.type }))}
                      cx="50%" cy="50%" outerRadius={60} dataKey="count" nameKey="type">
                      {type_breakdown.map((_: any, i: number) => (
                        <Cell key={i} fill={i === 0 ? '#F75835' : i === 1 ? '#203864' : '#0ea5e9'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5 mt-1">
                {type_breakdown.map((t: any, i: number) => (
                  <li key={t.type} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: i === 0 ? '#F75835' : i === 1 ? '#203864' : '#0ea5e9' }} />
                      <span className="text-gray-600 capitalize">{t.type}</span>
                    </span>
                    <span className="font-semibold text-gray-900">{t.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Top countries */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Globe size={16} className="text-gray-400" />
          <h3 className="font-semibold text-gray-900 text-sm">Top countries by sanctions hits</h3>
        </div>
        {top_countries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No country data yet</p>
        ) : (
          <div className="space-y-3">
            {top_countries.map((c: any, i: number) => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <span className="text-sm text-gray-700 w-32 truncate">{c.country}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round((c.count / maxCountry) * 100)}%`,
                      background: i === 0 ? '#F75835' : i === 1 ? '#203864' : '#6b7280',
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function KpiCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: React.ElementType; color: string; sub: string
}) {
  const colorMap: Record<string, string> = {
    brand:  'bg-[#F75835]/10 text-[#F75835]',
    red:    'bg-red-50 text-red-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon size={18} />
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}
