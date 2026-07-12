/**
 * Header do dashboard: menu mobile, usuário, role e logout.
 */

import type { ReactNode } from 'react'
import { LogOut, Menu, User as UserIcon } from 'lucide-react'
import type { User } from '../../types/auth'

const ROLE_LABEL: Record<User['role'], string> = {
  cliente: 'Cliente',
  barbeiro: 'Barbeiro',
  admin: 'Administrador',
}

interface HeaderProps {
  user: User
  onMenuClick: () => void
  onLogout: () => void
  /** Seletor de demo de role (opcional, útil em desenvolvimento) */
  demoRoleSwitcher?: ReactNode
}

export default function Header({ user, onMenuClick, onLogout, demoRoleSwitcher }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/5 bg-barber-black/95 px-3 sm:px-5 backdrop-blur-md">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-barber-light hover:bg-white/5 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="min-w-0 lg:hidden">
          <p className="truncate text-sm font-semibold text-barber-light">Dashboard</p>
        </div>
        <div className="hidden lg:block min-w-0">
          <p className="text-sm text-barber-light/50">Bem-vindo de volta</p>
          <p className="truncate font-semibold text-barber-light">{user.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {demoRoleSwitcher}

        <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-barber-black-soft px-2.5 py-1.5 sm:px-3 sm:py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-barber-gray text-barber-gold">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-barber-light max-w-[140px]">
              {user.name}
            </p>
            <p className="text-xs text-barber-gold">{ROLE_LABEL[user.role]}</p>
          </div>
          <span className="sm:hidden rounded-md bg-barber-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-barber-gold">
            {user.role}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-barber-light/80 transition-colors hover:border-barber-red/40 hover:bg-barber-red/10 hover:text-barber-red"
          aria-label="Sair da conta"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline text-sm font-medium">Sair</span>
        </button>
      </div>
    </header>
  )
}
