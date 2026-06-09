import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Search, FileText, Users, Settings, LogOut,
  ShieldCheck, Database, BarChart3, ChevronRight,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { LogoOnDark } from './Logo'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/screening', icon: Search, label: 'Screening' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/audit', icon: Database, label: 'Audit Log' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

const adminItems = [
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/tenants', icon: ShieldCheck, label: 'Tenants' },
]

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === 'super_admin'

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-dark text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center px-4 h-16 border-b border-white/10 shrink-0">
        <LogoOnDark variant={collapsed ? 'symbol' : 'full'} size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        {isSuperAdmin && (
          <>
            <div className={cn('mt-4 mb-1 px-3', collapsed && 'px-0 text-center')}>
              {!collapsed && (
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Administration
                </span>
              )}
            </div>
            {adminItems.map((item) => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-white/10 p-2 space-y-0.5">
        <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60',
            'hover:bg-white/10 hover:text-white transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Log out</span>}
        </button>
        {!collapsed && user && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-white/5">
            <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
            <p className="text-xs text-white/40 truncate">{user.tenant_name}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string
  icon: React.ElementType
  label: string
  collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed && 'justify-center',
          isActive
            ? 'bg-brand text-white'
            : 'text-white/60 hover:bg-white/10 hover:text-white',
        )
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          <ChevronRight size={14} className="text-white/30" />
        </>
      )}
    </NavLink>
  )
}
