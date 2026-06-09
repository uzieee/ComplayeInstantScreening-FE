import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/screening': 'Instant Screening',
  '/reports': 'Reports',
  '/audit': 'Audit Log',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/admin/users': 'User Management',
  '/admin/tenants': 'Tenant Management',
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
