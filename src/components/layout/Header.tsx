import { Bell, Search, PanelLeftClose, PanelLeft, HelpCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  pageTitle?: string
}

export function Header({ sidebarCollapsed, onToggleSidebar, pageTitle }: HeaderProps) {
  const { user } = useAuthStore()

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

      <div className="ml-auto flex items-center gap-1">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
        </button>

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
