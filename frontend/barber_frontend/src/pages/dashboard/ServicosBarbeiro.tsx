/**
 * Página completa — Meus Serviços (Barbeiro)
 * CRUD local com mock: listar, criar, editar, excluir e alternar status.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Plus, Scissors, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'
import type { Servico, ServicoFormData } from '../../types/servico'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import ServicoCard from '../../components/servicos/ServicoCard'
import ServicoFormModal from '../../components/servicos/ServicoFormModal'
import {
  BARBEIRO_DEMO_ID,
  MOCK_SERVICOS,
  delay,
  formatCurrency,
} from '../../data/mockServicos'

type FiltroStatus = 'todos' | 'ativos' | 'inativos'

/** Seletor de role para demonstração (mesmo padrão da Agenda) */
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

export default function ServicosBarbeiro() {
  const { user, logout, isAuthenticated, isLoading, setDemoRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [filtro, setFiltro] = useState<FiltroStatus>('todos')
  const [busca, setBusca] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Servico | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Carrega serviços do barbeiro (mock)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const t = window.setTimeout(() => {
      if (cancelled) return
      const barbeiroId = user?.id ?? BARBEIRO_DEMO_ID
      setServicos(
        MOCK_SERVICOS.filter((s) => s.barbeiroId === barbeiroId).map((s) => ({
          ...s,
        })),
      )
      setLoading(false)
    }, 550)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [user?.id])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return servicos
      .filter((s) => {
        if (filtro === 'ativos' && !s.ativo) return false
        if (filtro === 'inativos' && s.ativo) return false
        if (!q) return true
        return (
          s.nome.toLowerCase().includes(q) ||
          s.descricao.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [servicos, filtro, busca])

  const stats = useMemo(() => {
    const ativos = servicos.filter((s) => s.ativo).length
    const inativos = servicos.length - ativos
    return { total: servicos.length, ativos, inativos }
  }, [servicos])

  const openCreate = useCallback(() => {
    setEditing(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((servico: Servico) => {
    setEditing(servico)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
  }, [saving])

  const handleSubmit = useCallback(
    async (data: ServicoFormData) => {
      setSaving(true)
      try {
        await delay(450)
        const barbeiroId = user?.id ?? BARBEIRO_DEMO_ID

        if (editing) {
          setServicos((prev) =>
            prev.map((s) =>
              s.id === editing.id
                ? {
                    ...s,
                    nome: data.nome,
                    descricao: data.descricao,
                    duracaoMinutos: data.duracaoMinutos,
                    preco: data.preco,
                    ativo: data.ativo,
                  }
                : s,
            ),
          )
        } else {
          const novo: Servico = {
            id: `svc-${Date.now()}`,
            nome: data.nome,
            descricao: data.descricao,
            duracaoMinutos: data.duracaoMinutos,
            preco: data.preco,
            ativo: data.ativo,
            barbeiroId,
          }
          setServicos((prev) => [novo, ...prev])
        }

        setModalOpen(false)
        setEditing(null)
      } finally {
        setSaving(false)
      }
    },
    [editing, user?.id],
  )

  const requestDelete = useCallback((servico: Servico) => {
    setDeleteTarget(servico)
  }, [])

  const cancelDelete = useCallback(() => {
    if (deleting) return
    setDeleteTarget(null)
  }, [deleting])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setBusyId(deleteTarget.id)
    try {
      await delay(400)
      setServicos((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
      setBusyId(null)
    }
  }, [deleteTarget])

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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Serviços do barbeiro — exclusivo do role barbeiro
  if (user.role !== 'barbeiro') {
    return <Navigate to="/dashboard" replace />
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-barber-black text-barber-light">
      <Sidebar
        role={user.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="servicos"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          demoRoleSwitcher={
            setDemoRole ? (
              <DemoRoleSwitcher current={user.role} onChange={setDemoRole} />
            ) : undefined
          }
        />

        <main className="dashboard-scroll flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            {/* Cabeçalho */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-barber-light sm:text-3xl">
                  Meus Serviços
                </h1>
                <p className="mt-1 text-sm text-barber-light/55 sm:text-base">
                  Gerencie os serviços que você oferece
                </p>
                {!loading && (
                  <p className="mt-2 text-sm text-barber-light/45">
                    <span className="font-semibold text-barber-gold">
                      {stats.ativos}
                    </span>{' '}
                    ativos
                    <span className="mx-1.5 text-barber-light/25">·</span>
                    <span className="font-medium text-barber-light/70">
                      {stats.inativos}
                    </span>{' '}
                    inativos
                    <span className="mx-1.5 text-barber-light/25">·</span>
                    {stats.total} no total
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-barber-gold px-5 text-sm font-bold text-barber-black shadow-sm transition-colors hover:bg-barber-gold-hover active:scale-[0.98] sm:h-11"
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                Adicionar Serviço
              </button>
            </section>

            {/* Filtros */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="flex flex-wrap gap-1.5 rounded-xl border border-white/5 bg-barber-black-soft p-1"
                role="tablist"
                aria-label="Filtrar por status"
              >
                {(
                  [
                    { id: 'todos', label: 'Todos' },
                    { id: 'ativos', label: 'Ativos' },
                    { id: 'inativos', label: 'Inativos' },
                  ] as const
                ).map((opt) => {
                  const active = filtro === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFiltro(opt.id)}
                      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-barber-gold/15 text-barber-gold'
                          : 'text-barber-light/60 hover:bg-white/5 hover:text-barber-light'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              <label className="relative block w-full sm:max-w-xs">
                <span className="sr-only">Buscar serviço</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-barber-light/40"
                  aria-hidden
                />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome…"
                  className="h-11 w-full rounded-xl border border-white/10 bg-barber-black-soft py-2 pr-3 pl-10 text-sm text-barber-light placeholder:text-barber-light/35 focus:border-barber-gold/50 focus:outline-none focus:ring-1 focus:ring-barber-gold/40"
                />
              </label>
            </section>

            {/* Lista */}
            <section aria-live="polite" aria-busy={loading}>
              {loading && <ServicosLoadingState />}

              {!loading && filtrados.length === 0 && (
                <ServicosEmptyState
                  hasAny={servicos.length > 0}
                  busca={busca}
                  onAdd={openCreate}
                  onClearSearch={() => {
                    setBusca('')
                    setFiltro('todos')
                  }}
                />
              )}

              {!loading && filtrados.length > 0 && (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filtrados.map((servico) => (
                    <li key={servico.id}>
                      <ServicoCard
                        servico={servico}
                        onEdit={openEdit}
                        onDelete={requestDelete}
                        actionsDisabled={busyId === servico.id || saving}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>

      <ServicoFormModal
        open={modalOpen}
        servico={editing}
        onClose={closeModal}
        onSubmit={handleSubmit}
        saving={saving}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          servico={deleteTarget}
          deleting={deleting}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function ServicosLoadingState() {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Carregando serviços"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-white/5 bg-barber-black-soft p-5"
        >
          <div className="mb-3 h-5 w-2/3 rounded bg-white/10" />
          <div className="mb-2 h-3 w-full rounded bg-white/5" />
          <div className="mb-4 h-3 w-4/5 rounded bg-white/5" />
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <div className="h-4 w-16 rounded bg-white/5" />
            <div className="h-4 w-20 rounded bg-white/10" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-10 flex-1 rounded-xl bg-white/5" />
            <div className="h-10 flex-1 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
      <p className="col-span-full text-center text-sm text-barber-light/40">
        Carregando serviços…
      </p>
    </div>
  )
}

function ServicosEmptyState({
  hasAny,
  busca,
  onAdd,
  onClearSearch,
}: {
  hasAny: boolean
  busca: string
  onAdd: () => void
  onClearSearch: () => void
}) {
  if (hasAny) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-barber-black-soft px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-barber-gold/10">
          <Search className="h-7 w-7 text-barber-gold/80" />
        </div>
        <h3 className="text-lg font-semibold text-barber-light">
          Nenhum serviço encontrado
        </h3>
        <p className="mt-1 max-w-sm text-sm text-barber-light/50">
          {busca.trim()
            ? `Não há resultados para “${busca.trim()}” com o filtro atual.`
            : 'Não há serviços com o filtro de status selecionado.'}
        </p>
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-5 inline-flex h-10 items-center rounded-xl border border-barber-gold/30 bg-barber-gold/15 px-4 text-sm font-semibold text-barber-gold transition-colors hover:bg-barber-gold/25"
        >
          Limpar filtros
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-barber-black-soft px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-barber-gold/10">
        <Scissors className="h-7 w-7 text-barber-gold/80" />
      </div>
      <h3 className="text-lg font-semibold text-barber-light">
        Nenhum serviço cadastrado ainda
      </h3>
      <p className="mt-1 max-w-sm text-sm text-barber-light/50">
        Cadastre os cortes, barbas e combos que você oferece para que os
        clientes possam agendar.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-barber-gold px-5 text-sm font-bold text-barber-black transition-colors hover:bg-barber-gold-hover"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Adicionar Serviço
      </button>
    </div>
  )
}

function ConfirmDeleteModal({
  servico,
  deleting,
  onCancel,
  onConfirm,
}: {
  servico: Servico
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleting) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleting, onCancel])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Cancelar exclusão"
        onClick={() => !deleting && onCancel()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-servico-title"
        aria-describedby="delete-servico-desc"
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-white/10 bg-barber-black-soft p-5 shadow-2xl sm:rounded-2xl"
      >
        <h2
          id="delete-servico-title"
          className="text-lg font-semibold text-barber-light"
        >
          Excluir serviço?
        </h2>
        <p id="delete-servico-desc" className="mt-2 text-sm text-barber-light/60">
          Você está prestes a excluir{' '}
          <span className="font-semibold text-barber-light">
            “{servico.nome}”
          </span>{' '}
          ({formatCurrency(servico.preco)}). Esta ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-medium text-barber-light/80 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-barber-red px-5 text-sm font-bold text-white transition-colors hover:bg-barber-red-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Excluindo…
              </>
            ) : (
              'Sim, excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
