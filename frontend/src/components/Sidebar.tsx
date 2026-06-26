import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Settings, Package, Layers,
  FlaskConical, Scale, ClipboardList, ShieldCheck,
  Wind, Scissors, RotateCcw, Star, Users,
  ChevronRight, Truck, Box
} from 'lucide-react'

type NavItem = {
  label: string
  to: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard',        to: '/dashboard',        icon: <LayoutDashboard size={18} /> },
  { label: 'Gerenciamento',    to: '/gerenciamento',    icon: <Layers size={18} />, roles: ['Admin','Gerenciamento'] },
  { label: 'PCP',              to: '/pcp',              icon: <ClipboardList size={18} />, roles: ['Admin','PCP','Gerenciamento'] },
  { label: 'Almoxarifado',     to: '/almoxarifado',     icon: <Package size={18} />, roles: ['Admin','Almoxarifado','Gerenciamento'] },
  { label: 'Preparação',       to: '/preparacao',       icon: <Box size={18} /> },
  { label: 'Prep. em Lote',    to: '/preparacao-lote',  icon: <Box size={18} /> },
  { label: 'Produção (Box 1-3)', to: '/producao',       icon: <Settings size={18} /> },
  { label: 'Box 4',            to: '/box4',             icon: <Box size={18} /> },
  { label: 'Box 5',            to: '/box5',             icon: <Box size={18} /> },
  { label: 'Box 6',            to: '/box6',             icon: <Box size={18} /> },
  { label: 'Secadora',         to: '/secadora',         icon: <Wind size={18} /> },
  { label: 'Destrinchagem',    to: '/destrinchagem',    icon: <Scissors size={18} /> },
  { label: 'Enrolagem',        to: '/enrolagem',        icon: <RotateCcw size={18} /> },
  { label: 'Qualidade',        to: '/qualidade',        icon: <ShieldCheck size={18} /> },
  { label: 'Laboratório',      to: '/laboratorio',      icon: <FlaskConical size={18} /> },
  { label: 'Pesagem',          to: '/pesagem',          icon: <Scale size={18} /> },
  { label: 'Lista de Saída',   to: '/lista-saida',      icon: <Truck size={18} /> },
  { label: 'Qual. Malhas',     to: '/fabric-quality',   icon: <Star size={18} /> },
  { label: 'Configurações',    to: '/settings',         icon: <Settings size={18} /> },
  { label: 'Usuários',         to: '/admin',            icon: <Users size={18} />, roles: ['Admin'] },
]

export default function Sidebar() {
  const { user } = useAuth()

  const visible = navItems.filter(item => {
    if (!item.roles) return true
    if (!user) return false
    if (user.role === 'Admin') return true
    return item.roles.includes(user.role)
  })

  return (
    <aside className="w-56 flex-shrink-0 bg-sidebar flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">Colortim ERP</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 sidebar-scroll">
        <ul className="space-y-0.5 px-2">
          {visible.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-sidebar-active text-white'
                      : 'text-white/60 hover:bg-sidebar-hover hover:text-white'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-white/30 text-xs text-center">v1.0.0 — Colortim</p>
      </div>
    </aside>
  )
}
