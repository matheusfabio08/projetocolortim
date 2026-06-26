import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                <User size={14} className="text-primary-700" />
              </div>
              <span className="font-medium text-gray-800">{user?.name}</span>
              <span className="badge-gray text-xs">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="btn-ghost btn-sm text-gray-500 hover:text-red-600"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
