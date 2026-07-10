import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'
import './Cadastro.css'

/** Cadastro público: apenas CLIENTE e BARBEIRO (ADMIN tem página separada). */
type TipoUsuario = 'CLIENTE' | 'BARBEIRO'

type FormState = {
  nome: string
  email: string
  telefone: string
  cpf: string
  senha: string
  confirmarSenha: string
  tipoUsuario: TipoUsuario
  codEmpresa: string
}

type FormErrors = Partial<Record<keyof FormState | 'form', string>>

const TIPO_OPTIONS: { value: TipoUsuario; label: string; hint: string }[] = [
  { value: 'CLIENTE', label: 'Cliente', hint: 'Agendar horários e serviços' },
  { value: 'BARBEIRO', label: 'Barbeiro', hint: 'Atender na barbearia' },
]

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

const formatarTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

const formatarCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const validarCPF = (cpf: string) => {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i], 10) * (10 - i)
  let rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cleaned[9], 10)) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i], 10) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  return rest === parseInt(cleaned[10], 10)
}

const initialForm: FormState = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  senha: '',
  confirmarSenha: '',
  tipoUsuario: 'CLIENTE',
  codEmpresa: '',
}

export default function Cadastro() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const isBarbeiro = form.tipoUsuario === 'BARBEIRO'

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'telefone') {
      setForm((prev) => ({ ...prev, telefone: formatarTelefone(value) }))
    } else if (name === 'cpf') {
      setForm((prev) => ({ ...prev, cpf: formatarCpf(value) }))
    } else if (name === 'codEmpresa') {
      setForm((prev) => ({ ...prev, codEmpresa: value.toUpperCase() }))
    } else if (name === 'tipoUsuario') {
      const tipo = value as TipoUsuario
      setForm((prev) => ({
        ...prev,
        tipoUsuario: tipo,
        // Limpa campos exclusivos de barbeiro ao voltar para cliente
        ...(tipo === 'CLIENTE' ? { cpf: '', codEmpresa: '' } : {}),
      }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }

    // Limpa erro do campo ao digitar
    setErrors((prev) => {
      if (!prev[name as keyof FormState] && !prev.form) return prev
      const next = { ...prev }
      delete next[name as keyof FormState]
      delete next.form
      return next
    })
  }

  const validarFormulario = (): boolean => {
    const next: FormErrors = {}

    if (!form.nome.trim()) {
      next.nome = 'Informe seu nome'
    } else if (form.nome.trim().length < 3) {
      next.nome = 'Nome deve ter ao menos 3 caracteres'
    } else if (form.nome.trim().length > 150) {
      next.nome = 'Nome deve ter no máximo 150 caracteres'
    }

    if (!form.email.trim()) {
      next.email = 'Informe seu e-mail'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'E-mail inválido'
    } else if (form.email.length > 100) {
      next.email = 'E-mail deve ter no máximo 100 caracteres'
    }

    if (form.telefone) {
      const digits = form.telefone.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 11) {
        next.telefone = 'Telefone inválido'
      }
    }

    if (isBarbeiro) {
      if (!form.cpf.trim()) {
        next.cpf = 'CPF é obrigatório para barbeiros'
      } else if (!validarCPF(form.cpf)) {
        next.cpf = 'CPF inválido'
      }

      if (!form.codEmpresa.trim()) {
        next.codEmpresa = 'Informe o código da empresa'
      } else if (form.codEmpresa.trim().length > 20) {
        next.codEmpresa = 'Código deve ter no máximo 20 caracteres'
      }
    }

    if (!form.senha) {
      next.senha = 'Informe uma senha'
    } else if (form.senha.length < 6) {
      next.senha = 'A senha deve ter no mínimo 6 caracteres'
    } else if (form.senha.length > 255) {
      next.senha = 'Senha muito longa'
    }

    if (!form.confirmarSenha) {
      next.confirmarSenha = 'Confirme sua senha'
    } else if (form.senha !== form.confirmarSenha) {
      next.confirmarSenha = 'As senhas não coincidem'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    setLoading(true)
    setErrors({})

    // Payload alinhado à tabela usuario (+ cpf / cod_empresa para barbeiro)
    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      senha: form.senha,
      telefone: form.telefone.replace(/\D/g, '') || null,
      tipo_usuario: form.tipoUsuario,
      // ADMIN_BARBEARIA não é permitido neste formulário público
      cpf: isBarbeiro ? form.cpf.replace(/\D/g, '') : null,
      cod_empresa: isBarbeiro ? form.codEmpresa.trim().toUpperCase() : null,
      // status: PENDING_APPROVAL (default no banco, especialmente para barbeiro)
    }

    try {
      // Placeholder — integrar com a API de cadastro
      // const response = await fetch('http://localhost:8080/api/usuarios', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // })
      await new Promise((r) => setTimeout(r, 800))
      console.info('Cadastro payload (usuario):', payload)

      setErrors({
        form: isBarbeiro
          ? 'Cadastro ainda não conectado à API. Contas de barbeiro ficam pendentes de aprovação.'
          : 'Cadastro ainda não conectado à API. Em breve!',
      })

      // Quando a API estiver pronta:
      // if (response.ok) {
      //   setTimeout(() => navigate('/login'), 1800)
      // } else {
      //   const data = await response.json()
      //   setErrors({ form: data.message || 'Erro ao criar conta' })
      // }
    } catch {
      setErrors({ form: 'Erro de conexão com o servidor' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page cadastro-page">
      <div className="login-card cadastro-card">
        <header className="login-brand">
          <div className="login-logo">
            <ScissorsIcon />
          </div>
          <h1>Barbearia</h1>
          <p>Crie sua conta para começar</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <p className="form-error" role="alert">
              {errors.form}
            </p>
          )}

          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              name="nome"
              autoComplete="name"
              placeholder="Seu nome"
              maxLength={150}
              value={form.nome}
              onChange={handleChange}
              className={errors.nome ? 'error' : undefined}
              aria-invalid={!!errors.nome}
              aria-describedby={errors.nome ? 'nome-error' : undefined}
            />
            {errors.nome && (
              <p id="nome-error" className="field-error" role="alert">
                {errors.nome}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="seu@email.com"
              maxLength={100}
              value={form.email}
              onChange={handleChange}
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
            <label htmlFor="telefone">
              Telefone <span className="label-optional">(opcional)</span>
            </label>
            <input
              id="telefone"
              type="tel"
              name="telefone"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              inputMode="numeric"
              maxLength={15}
              value={form.telefone}
              onChange={handleChange}
              className={errors.telefone ? 'error' : undefined}
              aria-invalid={!!errors.telefone}
              aria-describedby={errors.telefone ? 'telefone-error' : undefined}
            />
            {errors.telefone && (
              <p id="telefone-error" className="field-error" role="alert">
                {errors.telefone}
              </p>
            )}
          </div>

          <fieldset className="form-group tipo-fieldset">
            <legend>Tipo de conta</legend>
            <div className="tipo-grid" role="radiogroup" aria-label="Tipo de usuário">
              {TIPO_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`tipo-option ${form.tipoUsuario === opt.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="tipoUsuario"
                    value={opt.value}
                    checked={form.tipoUsuario === opt.value}
                    onChange={handleChange}
                  />
                  <span className="tipo-label">{opt.label}</span>
                  <span className="tipo-hint">{opt.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {isBarbeiro && (
            <>
              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  name="cpf"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  value={form.cpf}
                  onChange={handleChange}
                  className={errors.cpf ? 'error' : undefined}
                  aria-invalid={!!errors.cpf}
                  aria-describedby={errors.cpf ? 'cpf-error' : 'cpf-hint'}
                />
                <p id="cpf-hint" className="field-hint">
                  Obrigatório para barbeiros. Usado na identificação e aprovação da conta.
                </p>
                {errors.cpf && (
                  <p id="cpf-error" className="field-error" role="alert">
                    {errors.cpf}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="codEmpresa">Código da empresa</label>
                <input
                  id="codEmpresa"
                  type="text"
                  name="codEmpresa"
                  autoComplete="organization"
                  placeholder="Ex: BARB001"
                  maxLength={20}
                  value={form.codEmpresa}
                  onChange={handleChange}
                  className={errors.codEmpresa ? 'error' : undefined}
                  aria-invalid={!!errors.codEmpresa}
                  aria-describedby={
                    errors.codEmpresa ? 'codEmpresa-error' : 'codEmpresa-hint'
                  }
                />
                <p id="codEmpresa-hint" className="field-hint">
                  Código fornecido pela barbearia. Barbeiros precisam estar vinculados a uma
                  empresa.
                </p>
                {errors.codEmpresa && (
                  <p id="codEmpresa-error" className="field-error" role="alert">
                    {errors.codEmpresa}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                name="senha"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                className={errors.senha ? 'error' : undefined}
                aria-invalid={!!errors.senha}
                aria-describedby={errors.senha ? 'senha-error' : undefined}
              />
              {errors.senha && (
                <p id="senha-error" className="field-error" role="alert">
                  {errors.senha}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar senha</label>
              <input
                id="confirmarSenha"
                type="password"
                name="confirmarSenha"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirmarSenha}
                onChange={handleChange}
                className={errors.confirmarSenha ? 'error' : undefined}
                aria-invalid={!!errors.confirmarSenha}
                aria-describedby={
                  errors.confirmarSenha ? 'confirmarSenha-error' : undefined
                }
              />
              {errors.confirmarSenha && (
                <p id="confirmarSenha-error" className="field-error" role="alert">
                  {errors.confirmarSenha}
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <footer className="login-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </footer>
      </div>
    </div>
  )
}
