/**
 * Dashboard principal — rota /dashboard
 *
 * Renderiza conteúdo diferente conforme user.role:
 *   - cliente  → DashboardCliente
 *   - barbeiro → DashboardBarbeiro
 *   - admin    → DashboardAdmin
 *
 * Layout compartilhado: Sidebar (drawer no mobile) + Header + conteúdo.
 *
 * Exemplo de uso do contexto:
 *   const { user, logout, isAuthenticated, isLoading } = useAuth()
 */

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import DashboardCliente from './DashboardCliente'
import DashboardBarbeiro from './DashboardBarbeiro'
import DashboardAdmin from './DashboardAdmin'

/** Seletor de role para demonstração (remova em produção) */
function DemoRoleSwitcher({
  current,
  onChange,
}: {
  current: UserRole
  onChange: (role: UserRole) => void
}) {
  const roles: UserRole[] = ['cliente', 'barbeiro', 'admin']

  return (
    <label className="hidden sm:flex items-center gap-1.5">
      <span className="sr-only">Trocar perfil demo</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value as UserRole)}
        className="h-10 max-w-[130px] rounded-lg border border-white/10 bg-barber-black-soft px-2 text-xs font-medium text-barber-light/80 focus:border-barber-gold/50 focus:outline-none"
        title="Trocar role (demo)"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            Demo: {r}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function Dashboard() {
  const { user, logout, isAuthenticated, isLoading, setDemoRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Estado de carregamento da sessão
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-barber-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-barber-gold border-t-transparent" />
          <p className="text-sm text-barber-light/60">Carregando…</p>
        </div>
      </div>
    )
  }

  // Proteção de rota — redireciona se não autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  /** Conteúdo dinâmico por role */
  function renderByRole() {
    switch (user!.role) {
      case 'cliente':
        return <DashboardCliente userName={user!.name} />
      case 'barbeiro':
        return <DashboardBarbeiro userName={user!.name} />
      case 'admin':
        return <DashboardAdmin />
      default:
        return (
          <p className="text-barber-light/60">
            Role desconhecida. Entre em contato com o suporte.
          </p>
        )
    }
  }

  return (
    <div className="flex min-h-svh bg-barber-black text-barber-light">
      <Sidebar
        role={user.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="home"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          demoRoleSwitcher={
            setDemoRole ? (
              <DemoRoleSwitcher
                current={user.role}
                onChange={setDemoRole}
              />
            ) : undefined
          }
        />

        <main className="dashboard-scroll flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{renderByRole()}</div>
        </main>
      </div>
    </div>
  )
}
