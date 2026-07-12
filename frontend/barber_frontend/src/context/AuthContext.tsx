/**
 * Contexto de autenticação — exemplo básico pronto para integrar com a API.
 *
 * Uso:
 *   const { user, logout, isAuthenticated } = useAuth()
 *
 * No App, envolva as rotas com <AuthProvider>.
 * Em produção, troque o mock de login por fetch/axios para o backend.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthContextValue, User, UserRole } from '../types/auth'

const STORAGE_KEY = 'barber_auth_user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Usuários mock para demonstração dos 3 dashboards */
const DEMO_USERS: Record<UserRole, User> = {
  cliente: {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos@email.com',
    role: 'cliente',
  },
  barbeiro: {
    id: '2',
    name: 'Rafael Mendes',
    email: 'rafael@barbearia.com',
    role: 'barbeiro',
  },
  admin: {
    id: '3',
    name: 'Admin Master',
    email: 'admin@barbearia.com',
    role: 'admin',
  },
}

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaura sessão ao montar
  useEffect(() => {
    const stored = loadStoredUser()
    // Em dev: se não houver sessão, inicia como cliente (demo)
    setUser(stored ?? DEMO_USERS.cliente)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USERS.cliente))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    // Placeholder — substituir por chamada real à API:
    // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    // const data = await res.json()
    await new Promise((r) => setTimeout(r, 400))

    const lower = email.toLowerCase()
    let next: User
    if (lower.includes('admin')) next = DEMO_USERS.admin
    else if (lower.includes('barbeiro') || lower.includes('barber')) next = DEMO_USERS.barbeiro
    else next = { ...DEMO_USERS.cliente, email }

    setUser(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const setDemoRole = useCallback((role: UserRole) => {
    const next = DEMO_USERS[role]
    setUser(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      setDemoRole,
    }),
    [user, isLoading, login, logout, setDemoRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para acessar autenticação em qualquer componente.
 * @throws se usado fora de <AuthProvider>
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return ctx
}
