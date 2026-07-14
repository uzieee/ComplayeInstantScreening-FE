import { Bell, Search, PanelLeftClose, PanelLeft, HelpCircle, AlertTriangle, CheckCircle, ShieldAlert, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { auditApi } from '@/services/api'
import { cn } from '@/utils/cn'
import { format, parseISO } from 'date-fns'

interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  pageTitle?: string
}

export function Header({ sidebarCollapsed, onToggleSidebar, pageTitle }: HeaderProps) {
  const { user } = useAuthStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const { data: auditData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const r = await auditApi.list(1, 'screening')
      return r.data
    },
    staleTime: 30000,
  })

  const notifications = (auditData?.items ?? []).slice(0, 8)
  const unreadCount = notifications.filter((n: any) => n.result === 'hit').length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
      >
        {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
      </button>

      {pageTitle && (
        <h1 className="text-base font-semibold text-gray-900 hidden sm:block">{pageTitle}</h1>
      )}

      {/* Global search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Quick search…"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono bg-gray-200 rounded px-1 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1 relative" ref={panelRef}>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle size={20} />
        </button>

        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F75835] flex items-center justify-center text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification panel */}
        {notifOpen && (
          <div className="absolute top-12 right-0 z-50 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Screening alerts</h3>
              <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No recent screenings</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {notifications.map((n: any) => {
                  const isHit = n.result === 'hit'
                  const isPossible = n.result === 'possible_match'
                  return (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <span className={cn(
                        'mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                        isHit ? 'bg-red-50' : isPossible ? 'bg-amber-50' : 'bg-green-50'
                      )}>
                        {isHit
                          ? <AlertTriangle size={13} className="text-red-600" />
                          : isPossible
                          ? <ShieldAlert size={13} className="text-amber-600" />
                          : <CheckCircle size={13} className="text-green-600" />
                        }
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{n.entity}</p>
                        <p className={cn('text-xs font-semibold mt-0.5',
                          isHit ? 'text-red-600' : isPossible ? 'text-amber-600' : 'text-green-600'
                        )}>
                          {isHit ? 'Sanctions hit' : isPossible ? 'Possible match' : 'Clear'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 mt-1">
                        {n.timestamp ? format(parseISO(n.timestamp), 'HH:mm') : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <a href="/audit" className="text-xs text-[#F75835] font-medium hover:underline">
                View full audit log →
              </a>
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="ml-1 flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
            <span className="text-sm font-bold text-brand">
              {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.full_name}</p>
            <p className={cn('text-xs leading-tight capitalize', roleColor(user?.role))}>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

function roleColor(role?: string) {
  switch (role) {
    case 'super_admin': return 'text-brand font-medium'
    case 'tenant_admin': return 'text-blue-600'
    default: return 'text-gray-400'
  }
}
