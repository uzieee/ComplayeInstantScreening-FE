import { useQuery } from '@tanstack/react-query'
import {
  Search, TrendingUp, AlertTriangle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, ShieldAlert, FileText, Download,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { dashboardApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { DashboardStats } from '@/types'

const RISK_COLORS = {
  clear: '#22c55e',
  hits: '#ef4444',
  possible_matches: '#f59e0b',
  pending: '#6b7280',
}

const RESULT_CONFIG = {
  clear: { label: 'Clear', cls: 'badge-green', icon: CheckCircle },
  hit: { label: 'Hit', cls: 'badge-red', icon: AlertTriangle },
  possible_match: { label: 'Possible match', cls: 'badge-orange', icon: ShieldAlert },
  pending: { label: 'Pending', cls: 'badge-gray', icon: Clock },
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await dashboardApi.getStats()
      return res.data
    },
    staleTime: 0,
    refetchOnMount: 'always',
  })

  if (isLoading || !stats) return <div className="flex justify-center pt-20"><Spinner size={32} /></div>

  const quotaPct = stats.quota_total > 0 ? Math.round((stats.quota_used / stats.quota_total) * 100) : 0

  const pieData = [
    { name: 'Clear', value: stats.risk_breakdown.clear, color: RISK_COLORS.clear },
    { name: 'Hits', value: stats.risk_breakdown.hits, color: RISK_COLORS.hits },
    { name: 'Possible', value: stats.risk_breakdown.possible_matches, color: RISK_COLORS.possible_matches },
    { name: 'Pending', value: stats.risk_breakdown.pending, color: RISK_COLORS.pending },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Good {greeting()}, {user?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.tenant_name} · {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        <Button size="md" className="gap-2">
          <Search size={16} /> New Screening
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Searches today"
          value={stats.total_searches_today}
          change="+12%"
          positive
          icon={Search}
          color="brand"
        />
        <StatCard
          label="This month"
          value={stats.total_searches_month.toLocaleString()}
          change="+8%"
          positive
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          label="Hits today"
          value={stats.hits_today}
          change="-3"
          positive
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Pending reviews"
          value={stats.pending_reviews}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Trend chart */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Screening activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 14 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-brand inline-block rounded" /> Searches
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-400 inline-block rounded" /> Hits
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.search_trend ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E85D26" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E85D26" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(v) => format(parseISO(v), 'd MMM')}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                labelFormatter={(v) => format(parseISO(v as string), 'd MMM yyyy')}
              />
              <Area type="monotone" dataKey="searches" stroke="#E85D26" strokeWidth={2} fill="url(#colorSearches)" dot={false} />
              <Area type="monotone" dataKey="hits" stroke="#ef4444" strokeWidth={2} fill="none" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Risk breakdown</h3>
          <p className="text-xs text-gray-400 mb-4">This month</p>
          <div className="flex justify-center">
            {pieData.every((d) => d.value === 0) ? (
              <div className="w-40 h-40 rounded-full border-[14px] border-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-300">No data yet</span>
              </div>
            ) : (
              <div style={{ width: 160, height: 160 }}>
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              </PieChart>
              </div>
            )}
          </div>
          <ul className="space-y-2 mt-2">
            {pieData.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </span>
                <span className="font-semibold text-gray-900">{d.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Recent activity</h3>
            <button className="text-xs text-brand hover:text-brand-dark font-medium">View all</button>
          </div>
          {stats.recent_activity.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search size={24} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No screenings yet</p>
              <p className="text-xs text-gray-300 mt-0.5">Run your first screening to see activity here</p>
            </div>
          )}
          <div className="divide-y divide-gray-50">
            {stats.recent_activity.map((item) => {
              const cfg = RESULT_CONFIG[item.result]
              const Icon = cfg.icon
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                    item.result === 'clear' ? 'bg-green-50' :
                    item.result === 'hit' ? 'bg-red-50' :
                    item.result === 'possible_match' ? 'bg-amber-50' : 'bg-gray-50',
                  )}>
                    <Icon size={14} className={
                      item.result === 'clear' ? 'text-green-600' :
                      item.result === 'hit' ? 'text-red-600' :
                      item.result === 'possible_match' ? 'text-amber-600' : 'text-gray-500'
                    } />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.entity}</p>
                    <p className="text-xs text-gray-400">{item.action} · {item.user}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn('badge text-xs', cfg.cls)}>{cfg.label}</span>
                    <p className="text-xs text-gray-400 mt-1">{relativeTime(item.timestamp)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quota + quick links */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Plan usage</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">{stats.quota_used.toLocaleString()}</span>
              <span className="text-xs text-gray-400">/ {stats.quota_total.toLocaleString()} searches</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', quotaPct > 80 ? 'bg-red-500' : quotaPct > 60 ? 'bg-amber-400' : 'bg-brand')}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{quotaPct}% of monthly quota used</p>
            {quotaPct > 80 && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                Approaching quota limit — consider upgrading your plan.
              </p>
            )}
          </div>

          <div className="card p-5 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Quick actions</h3>
            {[
              { icon: Search, label: 'Screen an entity', to: '/screening' },
              { icon: FileText, label: 'Generate report', to: '/reports' },
              { icon: Download, label: 'Download audit log', to: '/audit' },
            ].map(({ icon: Icon, label, to }) => (
              <a
                key={label}
                href={to}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Icon size={15} className="text-brand" />
                </span>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                <ArrowUpRight size={14} className="ml-auto text-gray-300 group-hover:text-brand" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, change, positive, icon: Icon, color,
}: {
  label: string
  value: number | string
  change?: string
  positive?: boolean
  icon: React.ElementType
  color: 'brand' | 'blue' | 'red' | 'amber'
}) {
  const colorMap = {
    brand: 'bg-brand/10 text-brand',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon size={18} />
        </span>
        {change && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', positive ? 'text-green-600' : 'text-red-500')}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return format(parseISO(iso), 'd MMM')
}
