/**
 * Sidebar lateral (desktop) / drawer (mobile).
 * Itens de menu variam conforme o role do usuário.
 */

import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CalendarPlus,
  ClipboardList,
  Home,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
  X,
  Image,
  BarChart3,
  UserPlus,
} from 'lucide-react'
import type { UserRole } from '../../types/auth'

export interface NavItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  href: string
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  cliente: [
    { id: 'home', label: 'Início', icon: Home, href: '/dashboard#inicio' },
    { id: 'novo-agendamento', label: 'Novo Agendamento', icon: CalendarPlus, href: '/agendamento' },
    { id: 'agenda', label: 'Meus Agendamentos', icon: Calendar, href: '/dashboard#agendamentos' },
    { id: 'servicos', label: 'Serviços', icon: Scissors, href: '/dashboard#servicos' },
    { id: 'historico', label: 'Histórico', icon: ClipboardList, href: '/dashboard#historico' },
    { id: 'config', label: 'Configurações', icon: Settings, href: '/dashboard#config' },
  ],
  barbeiro: [
    { id: 'home', label: 'Início', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'agenda', label: 'Agenda do Dia', icon: Calendar, href: '/dashboard/agenda' },
    { id: 'servicos', label: 'Serviços', icon: Scissors, href: '/dashboard#servicos' },
    { id: 'portfolio', label: 'Portfólio', icon: Image, href: '/dashboard#portfolio' },
    { id: 'clientes', label: 'Clientes', icon: Users, href: '/dashboard#clientes' },
    { id: 'config', label: 'Configurações', icon: Settings, href: '/dashboard#config' },
  ],
  admin: [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard, href: '#inicio' },
    { id: 'agenda', label: 'Agendamentos', icon: Calendar, href: '#agendamentos' },
    { id: 'barbeiros', label: 'Barbeiros', icon: Scissors, href: '#barbeiros' },
    { id: 'clientes', label: 'Clientes', icon: Users, href: '#clientes' },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, href: '#relatorios' },
    { id: 'cadastros', label: 'Cadastros', icon: UserPlus, href: '#cadastros' },
    { id: 'config', label: 'Configurações', icon: Settings, href: '#config' },
  ],
}

interface SidebarProps {
  role: UserRole
  open: boolean
  onClose: () => void
  activeId?: string
}

export default function Sidebar({ role, open, onClose, activeId = 'home' }: SidebarProps) {
  const items = NAV_BY_ROLE[role]

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-[min(288px,85vw)] flex-col border-r border-white/5 bg-barber-black transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu principal"
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/5 px-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-barber-gold bg-barber-gray">
              <Scissors className="h-5 w-5 text-barber-gold" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-barber-light leading-tight">Barbearia</p>
              <p className="truncate text-xs text-barber-gold capitalize">{role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-barber-light/70 hover:bg-white/5 hover:text-barber-light lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="dashboard-scroll flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = item.id === activeId
            const isHashOnly = item.href.startsWith('#')
            const className = `flex min-h-[48px] items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition-colors ${
              active
                ? 'bg-barber-gold/15 text-barber-gold'
                : 'text-barber-light/70 hover:bg-white/5 hover:text-barber-light'
            }`

            if (isHashOnly) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={className}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </a>
              )
            }

            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={onClose}
                className={className}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <p className="text-center text-xs text-barber-light/40">
            Sistema de Gestão · v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
