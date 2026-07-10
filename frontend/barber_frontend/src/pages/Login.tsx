import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

function ScissorsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const next: typeof errors = {}

    if (!email.trim()) {
      next.email = 'Informe seu e-mail'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'E-mail inválido'
    }

    if (!password) {
      next.password = 'Informe sua senha'
    } else if (password.length < 6) {
      next.password = 'A senha deve ter ao menos 6 caracteres'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})

    // Placeholder — integrar com a API de autenticação
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setErrors({ form: 'Login ainda não conectado à API. Em breve!' })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-brand">
          <div className="login-logo">
            <ScissorsIcon />
          </div>
          <h1>Barbearia</h1>
          <p>Entre na sua conta para continuar</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {errors.form && <p className="form-error" role="alert">{errors.form}</p>}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'error' : undefined}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="field-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error' : undefined}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="field-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="form-options">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Lembrar-me
            </label>
            <a href="#esqueci-senha" className="forgot-link">
              Esqueci a senha
            </a>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <footer className="login-footer">
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </footer>
      </div>
    </div>
  )
}
