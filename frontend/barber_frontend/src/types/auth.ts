/**
 * Tipos de autenticação e papéis do sistema de barbearia.
 */

export type UserRole = 'cliente' | 'barbeiro' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  /** URL opcional do avatar */
  avatarUrl?: string
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  /** Útil em dev / demos: troca o role sem re-login */
  setDemoRole?: (role: UserRole) => void
}
