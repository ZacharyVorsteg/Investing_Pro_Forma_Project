import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderOpen, 
  PlusCircle, 
  Settings, 
  LogOut,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-lg
      transition-all duration-200 group
      ${isActive 
        ? 'bg-emerald-500/20 text-emerald-400 border-l-4 border-emerald-500 -ml-[4px] pl-[20px]' 
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
    `}
  >
    <span className="w-5 h-5 flex-shrink-0">{icon}</span>
    <span className="font-medium">{label}</span>
  </NavLink>
)

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/95 border-r border-slate-700/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Investor Pro</h1>
            <p className="text-xs text-slate-400">Pro Forma Analysis</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main
          </p>
          <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" end />
          <NavItem to="/projects" icon={<FolderOpen />} label="My Projects" />
          <NavItem to="/projects/new" icon={<PlusCircle />} label="New Analysis" />
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Tools
          </p>
          <NavItem to="/calculators" icon={<FileSpreadsheet />} label="Calculators" />
          <NavItem to="/templates" icon={<Building2 />} label="Templates" />
        </div>

        <div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Support
          </p>
          <NavItem to="/settings" icon={<Settings />} label="Settings" />
          <NavItem to="/help" icon={<HelpCircle />} label="Help & Docs" />
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.full_name || 'Investor'}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

