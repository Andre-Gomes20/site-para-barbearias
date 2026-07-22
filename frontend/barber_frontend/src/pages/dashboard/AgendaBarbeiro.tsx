/**
 * Página completa — Agenda do Barbeiro
 * Lista cronológica de agendamentos com filtros, ações e slots livres.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CalendarDays, Clock3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'
import type { Agendamento, FiltroDataId, TimelineItem } from '../../types/agenda'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import FiltroData from '../../components/agenda/FiltroData'
import AgendamentoCard, {
  SlotLivreCard,
} from '../../components/agenda/AgendamentoCard'
import {
  MOCK_AGENDAMENTOS,
  toISODate,
} from '../../data/mockAgenda'

/** Gap mínimo (min) para exibir slot livre entre atendimentos */
const MIN_GAP_LIVRE = 15

/** Seletor de role para demonstração */
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

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Segunda como início da semana
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

/** Monta timeline com slots livres entre agendamentos ativos */
function buildTimeline(items: Agendamento[]): TimelineItem[] {
  const sorted = [...items]
    .filter((a) => a.status !== 'cancelado')
    .sort(
      (a, b) => parseTimeToMinutes(a.horario) - parseTimeToMinutes(b.horario),
    )

  const cancelled = items
    .filter((a) => a.status === 'cancelado')
    .sort(
      (a, b) => parseTimeToMinutes(a.horario) - parseTimeToMinutes(b.horario),
    )

  const timeline: TimelineItem[] = []
  let prevEnd: number | null = null

  for (const ag of sorted) {
    const start = parseTimeToMinutes(ag.horario)
    if (prevEnd !== null) {
      const gap = start - prevEnd
      if (gap >= MIN_GAP_LIVRE) {
        timeline.push({
          id: `livre-${prevEnd}-${start}`,
          tipo: 'livre',
          horarioInicio: minutesToTime(prevEnd),
          horarioFim: minutesToTime(start),
          duracaoMin: gap,
        })
      }
    }
    timeline.push({ tipo: 'agendamento', agendamento: ag })
    prevEnd = start + ag.duracaoMin
  }

  // Cancelados no final da lista (mantém visibilidade sem poluir a grade)
  for (const ag of cancelled) {
    timeline.push({ tipo: 'agendamento', agendamento: ag })
  }

  return timeline
}

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AgendaBarbeiro() {
  const { user, logout, isAuthenticated, isLoading, setDemoRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [filtro, setFiltro] = useState<FiltroDataId>('hoje')
  const [dataCalendario, setDataCalendario] = useState(() => toISODate(new Date()))
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  // Simula carregamento da API
  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setAgendamentos(MOCK_AGENDAMENTOS.map((a) => ({ ...a })))
      setLoading(false)
    }, 600)
    return () => window.clearTimeout(t)
  }, [])

  const hojeISO = toISODate(new Date())
  const amanhaISO = toISODate(addDays(new Date(), 1))

  const dataAlvo = useMemo(() => {
    switch (filtro) {
      case 'hoje':
        return hojeISO
      case 'amanha':
        return amanhaISO
      case 'calendario':
        return dataCalendario
      case 'semana':
        return null // intervalo
      default:
        return hojeISO
    }
  }, [filtro, hojeISO, amanhaISO, dataCalendario])

  const filtrados = useMemo(() => {
    if (filtro === 'semana') {
      const start = startOfWeek(new Date())
      const end = endOfWeek(new Date())
      return agendamentos.filter((a) => {
        const [y, m, d] = a.data.split('-').map(Number)
        const date = new Date(y, m - 1, d)
        return date >= start && date <= end
      })
    }
    if (!dataAlvo) return []
    return agendamentos.filter((a) => a.data === dataAlvo)
  }, [agendamentos, filtro, dataAlvo])

  /** Lista por dia (semana agrupa) */
  const gruposPorDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>()
    for (const a of filtrados) {
      const list = map.get(a.data) ?? []
      list.push(a)
      map.set(a.data, list)
    }
    return Array.from(map.entries()).sort(([da], [db]) => da.localeCompare(db))
  }, [filtrados])

  const restantes = useMemo(
    () =>
      filtrados.filter(
        (a) => a.status === 'pendente' || a.status === 'confirmado',
      ).length,
    [filtrados],
  )

  const handleConcluir = useCallback((id: string) => {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'concluido' as const } : a)),
    )
  }, [])

  const handleCancelar = useCallback((id: string) => {
    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'cancelado' as const,
              observacao: a.observacao ?? 'Cancelado pelo barbeiro',
            }
          : a,
      ),
    )
  }, [])

  const goHoje = useCallback(() => {
    setFiltro('hoje')
    setDataCalendario(hojeISO)
  }, [hojeISO])

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

  // Agenda é exclusiva do barbeiro (admin pode ser adicionado depois)
  if (user.role !== 'barbeiro') {
    return <Navigate to="/dashboard" replace />
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const firstName = user.name.split(' ')[0]
  const subtitleDate =
    filtro === 'semana'
      ? 'esta semana'
      : formatLongDate(dataAlvo ?? hojeISO)

  return (
    <div className="flex min-h-svh bg-barber-black text-barber-light">
      <Sidebar
        role={user.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="agenda"
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
            {/* Cabeçalho da agenda */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm capitalize text-barber-light/50">
                  {subtitleDate}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-barber-light sm:text-3xl">
                  Agenda de {firstName}
                </h1>
                <p className="mt-1 text-sm text-barber-light/55 sm:text-base">
                  {loading ? (
                    'Carregando atendimentos…'
                  ) : (
                    <>
                      Você tem{' '}
                      <span className="font-semibold text-barber-gold">
                        {restantes}
                      </span>{' '}
                      {restantes === 1
                        ? 'atendimento restante'
                        : 'atendimentos restantes'}
                      {filtro === 'hoje'
                        ? ' hoje'
                        : filtro === 'amanha'
                          ? ' amanhã'
                          : filtro === 'semana'
                            ? ' nesta semana'
                            : ' nesta data'}
                      .
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={goHoje}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-xl border border-barber-gold/30 bg-barber-gold/15 px-3.5 text-sm font-semibold text-barber-gold transition-colors hover:bg-barber-gold/25"
              >
                <CalendarDays className="h-4 w-4" />
                Hoje
              </button>
            </section>

            {/* Filtros */}
            <FiltroData
              value={filtro}
              onChange={setFiltro}
              selectedDate={dataCalendario}
              onDatePick={(iso) => {
                setDataCalendario(iso)
                setFiltro('calendario')
              }}
            />

            {/* Lista */}
            <section aria-live="polite" aria-busy={loading}>
              {loading && <AgendaLoadingState />}

              {!loading && filtrados.length === 0 && (
                <AgendaEmptyState filtro={filtro} />
              )}

              {!loading &&
                gruposPorDia.map(([data, items]) => {
                  const timeline = buildTimeline(items)
                  const showDateHeader =
                    filtro === 'semana' || gruposPorDia.length > 1

                  return (
                    <div key={data} className="mb-8 last:mb-0">
                      {showDateHeader && (
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium capitalize text-barber-light/60">
                          <Clock3 className="h-4 w-4 text-barber-gold" />
                          {formatLongDate(data)}
                          <span className="text-barber-light/35">
                            · {items.length}{' '}
                            {items.length === 1 ? 'agendamento' : 'agendamentos'}
                          </span>
                        </h2>
                      )}

                      <ul className="space-y-2.5">
                        {timeline.map((item) => {
                          if (item.tipo === 'livre') {
                            return (
                              <li key={item.id}>
                                <SlotLivreCard
                                  horarioInicio={item.horarioInicio}
                                  horarioFim={item.horarioFim}
                                  duracaoMin={item.duracaoMin}
                                />
                              </li>
                            )
                          }
                          return (
                            <li key={item.agendamento.id}>
                              <AgendamentoCard
                                agendamento={item.agendamento}
                                onConcluir={handleConcluir}
                                onCancelar={handleCancelar}
                              />
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function AgendaLoadingState() {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando agenda">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex animate-pulse gap-3 rounded-2xl border border-white/5 bg-barber-black-soft p-4"
        >
          <div className="h-14 w-16 shrink-0 rounded-lg bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
            <div className="h-3 w-1/4 rounded bg-white/5" />
          </div>
        </div>
      ))}
      <p className="text-center text-sm text-barber-light/40">
        Carregando agendamentos…
      </p>
    </div>
  )
}

function AgendaEmptyState({ filtro }: { filtro: FiltroDataId }) {
  const msg =
    filtro === 'hoje'
      ? 'Nenhum agendamento para hoje'
      : filtro === 'amanha'
        ? 'Nenhum agendamento para amanhã'
        : filtro === 'semana'
          ? 'Nenhum agendamento nesta semana'
          : 'Nenhum agendamento nesta data'

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-barber-black-soft px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-barber-gold/10">
        <CalendarDays className="h-7 w-7 text-barber-gold/80" />
      </div>
      <h3 className="text-lg font-semibold text-barber-light">{msg}</h3>
      <p className="mt-1 max-w-sm text-sm text-barber-light/50">
        Quando houver novos horários marcados, eles aparecerão aqui em ordem
        cronológica.
      </p>
    </div>
  )
}
