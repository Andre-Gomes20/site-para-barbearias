/**
 * Página completa — Meu Portfólio (Barbeiro)
 * CRUD local com mock: listar, adicionar e excluir fotos.
 * O barbeiro gerencia apenas o próprio portfólio.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ImagePlus, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'
import type { PortfolioFormData, PortfolioItem } from '../../types/portfolio'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import PortfolioCard from '../../components/portfolio/PortfolioCard'
import PortfolioFormModal from '../../components/portfolio/PortfolioFormModal'
import {
  BARBEIRO_DEMO_ID,
  MOCK_PORTFOLIO,
  delay,
} from '../../data/mockPortfolio'

/** Seletor de role para demonstração (mesmo padrão de Serviços/Agenda) */
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

export default function PortfolioBarbeiro() {
  const { user, logout, isAuthenticated, isLoading, setDemoRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [itens, setItens] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Carrega portfólio do barbeiro logado (mock)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const t = window.setTimeout(() => {
      if (cancelled) return
      const barbeiroId = user?.id ?? BARBEIRO_DEMO_ID
      setItens(
        MOCK_PORTFOLIO.filter((p) => p.barbeiroId === barbeiroId).map((p) => ({
          ...p,
        })),
      )
      setLoading(false)
    }, 550)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [user?.id])

  const ordenados = useMemo(
    () =>
      [...itens].sort(
        (a, b) =>
          new Date(b.dataPostagem).getTime() -
          new Date(a.dataPostagem).getTime(),
      ),
    [itens],
  )

  const openCreate = useCallback(() => {
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    if (saving) return
    setModalOpen(false)
  }, [saving])

  const handleSubmit = useCallback(
    async (data: PortfolioFormData) => {
      setSaving(true)
      try {
        await delay(450)
        const barbeiroId = user?.id ?? BARBEIRO_DEMO_ID

        // Em produção: upload do arquivo → URL da API.
        // No mock usamos o preview local (object URL) como urlImagem.
        const urlImagem =
          data.previewUrl ||
          (data.arquivo ? URL.createObjectURL(data.arquivo) : '')

        const novo: PortfolioItem = {
          id: `port-${Date.now()}`,
          urlImagem,
          legenda: data.legenda,
          dataPostagem: new Date().toISOString(),
          barbeiroId,
        }

        setItens((prev) => [novo, ...prev])
        setModalOpen(false)
      } finally {
        setSaving(false)
      }
    },
    [user?.id],
  )

  const requestDelete = useCallback((item: PortfolioItem) => {
    setDeleteTarget(item)
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
      setItens((prev) => prev.filter((p) => p.id !== deleteTarget.id))
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

  // Portfólio do barbeiro — exclusivo do role barbeiro
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
        activeId="portfolio"
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
                  Meu Portfólio
                </h1>
                <p className="mt-1 text-sm text-barber-light/55 sm:text-base">
                  Mostre seus melhores trabalhos para os clientes
                </p>
                {!loading && (
                  <p className="mt-2 text-sm text-barber-light/45">
                    <span className="font-semibold text-barber-gold">
                      {itens.length}
                    </span>{' '}
                    {itens.length === 1 ? 'foto' : 'fotos'} no portfólio
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-barber-gold px-5 text-sm font-bold text-barber-black shadow-sm transition-colors hover:bg-barber-gold-hover active:scale-[0.98] sm:h-11"
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                Adicionar Foto
              </button>
            </section>

            {/* Grid */}
            <section aria-live="polite" aria-busy={loading}>
              {loading && <PortfolioLoadingState />}

              {!loading && ordenados.length === 0 && (
                <PortfolioEmptyState onAdd={openCreate} />
              )}

              {!loading && ordenados.length > 0 && (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {ordenados.map((item) => (
                    <li key={item.id}>
                      <PortfolioCard
                        item={item}
                        onDelete={requestDelete}
                        actionsDisabled={busyId === item.id || saving}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>

      <PortfolioFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        saving={saving}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          item={deleteTarget}
          deleting={deleting}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function PortfolioLoadingState() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Carregando portfólio"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-barber-black-soft"
        >
          <div className="aspect-[4/5] w-full bg-white/5" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/3 rounded bg-white/5" />
          </div>
        </div>
      ))}
      <p className="col-span-full text-center text-sm text-barber-light/40">
        Carregando portfólio…
      </p>
    </div>
  )
}

function PortfolioEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-barber-black-soft px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-barber-gold/10">
        <ImagePlus className="h-7 w-7 text-barber-gold/80" />
      </div>
      <h3 className="text-lg font-semibold text-barber-light">
        Nenhuma foto no portfólio ainda
      </h3>
      <p className="mt-1 max-w-sm text-sm text-barber-light/50">
        Adicione seus melhores trabalhos!
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-barber-gold px-5 text-sm font-bold text-barber-black transition-colors hover:bg-barber-gold-hover"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Adicionar Foto
      </button>
    </div>
  )
}

function ConfirmDeleteModal({
  item,
  deleting,
  onCancel,
  onConfirm,
}: {
  item: PortfolioItem
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

  const legenda = item.legenda?.trim()

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
        aria-labelledby="delete-portfolio-title"
        aria-describedby="delete-portfolio-desc"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-white/10 bg-barber-black-soft shadow-2xl sm:rounded-2xl"
      >
        {/* Mini preview */}
        <div className="relative h-36 w-full bg-barber-gray">
          <img
            src={item.urlImagem}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-barber-black-soft to-transparent" />
        </div>

        <div className="p-5 pt-3">
          <h2
            id="delete-portfolio-title"
            className="text-lg font-semibold text-barber-light"
          >
            Excluir foto do portfólio?
          </h2>
          <p
            id="delete-portfolio-desc"
            className="mt-2 text-sm text-barber-light/60"
          >
            {legenda ? (
              <>
                Você está prestes a excluir a foto{' '}
                <span className="font-semibold text-barber-light">
                  “{legenda}”
                </span>
                . Esta ação não pode ser desfeita.
              </>
            ) : (
              'Você está prestes a excluir esta foto. Esta ação não pode ser desfeita.'
            )}
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
    </div>
  )
}
