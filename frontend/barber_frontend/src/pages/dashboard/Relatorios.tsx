/**
 * Página completa — Relatórios
 * Admin: visão geral da barbearia + filtro por barbeiro
 * Barbeiro: apenas os próprios dados
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarCheck,
  DollarSign,
  Percent,
  Receipt,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'
import type {
  DateRange,
  PeriodoId,
  RelatorioAgregado,
} from '../../types/relatorio'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import MetricCard from '../../components/dashboard/MetricCard'
import FiltroPeriodo from '../../components/relatorios/FiltroPeriodo'
import FiltroBarbeiro from '../../components/relatorios/FiltroBarbeiro'
import GraficoFaturamento from '../../components/relatorios/GraficoFaturamento'
import GraficoServicos from '../../components/relatorios/GraficoServicos'
import GraficoPerformanceBarbeiros from '../../components/relatorios/GraficoPerformanceBarbeiros'
import TabelaServicos from '../../components/relatorios/TabelaServicos'
import TabelaAtendimentos from '../../components/relatorios/TabelaAtendimentos'
import {
  BARBEIROS_DEMO,
  aggregateRelatorio,
  delay,
  formatCurrency,
  resolveDateRange,
  toISODate,
} from '../../data/mockRelatorios'

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

function defaultCustomRange(): DateRange {
  const hoje = new Date()
  const inicio = new Date(hoje)
  inicio.setDate(inicio.getDate() - 6)
  return { inicio: toISODate(inicio), fim: toISODate(hoje) }
}

export default function Relatorios() {
  const { user, logout, isAuthenticated, isLoading, setDemoRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [periodo, setPeriodo] = useState<PeriodoId>('semana')
  const [customRange, setCustomRange] = useState<DateRange>(defaultCustomRange)
  const [barbeiroFiltro, setBarbeiroFiltro] = useState<string>('todos')

  const [loading, setLoading] = useState(true)
  const [relatorio, setRelatorio] = useState<RelatorioAgregado | null>(null)

  const isAdmin = user?.role === 'admin'
  const isBarbeiro = user?.role === 'barbeiro'

  const dateRange = useMemo(
    () => resolveDateRange(periodo, customRange),
    [periodo, customRange],
  )

  // Barbeiro sempre vê só os próprios dados
  const barbeiroIdEfetivo = useMemo(() => {
    if (isBarbeiro) return user?.id ?? null
    if (isAdmin) {
      return barbeiroFiltro === 'todos' ? null : barbeiroFiltro
    }
    return null
  }, [isAdmin, isBarbeiro, user?.id, barbeiroFiltro])

  // Recarrega agregação ao mudar filtros / usuário
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'barbeiro')) return

    let cancelled = false
    setLoading(true)

    ;(async () => {
      await delay(450)
      if (cancelled) return
      const data = aggregateRelatorio(dateRange, barbeiroIdEfetivo)
      setRelatorio(data)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user, dateRange, barbeiroIdEfetivo])

  const handlePeriodoChange = useCallback((p: PeriodoId) => {
    setPeriodo(p)
  }, [])

  const hasData =
    !!relatorio &&
    (relatorio.metricas.quantidadeAtendimentos > 0 ||
      relatorio.metricas.faturamentoTotal > 0 ||
      relatorio.atendimentosRecentes.length > 0)

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

  // Relatórios: admin e barbeiro
  if (user.role !== 'admin' && user.role !== 'barbeiro') {
    return <Navigate to="/dashboard" replace />
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const metricas = relatorio?.metricas

  return (
    <div className="flex min-h-svh bg-barber-black text-barber-light">
      <Sidebar
        role={user.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="relatorios"
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
            <section>
              <h1 className="text-2xl font-bold text-barber-light sm:text-3xl">
                Relatórios
              </h1>
              <p className="mt-1 text-sm text-barber-light/55 sm:text-base">
                {isAdmin
                  ? 'Acompanhe o desempenho geral da barbearia'
                  : 'Acompanhe o desempenho dos seus atendimentos'}
              </p>
              <p className="mt-1.5 text-xs text-barber-light/40">
                Período: {formatRangeLabel(dateRange)}
                {isAdmin && barbeiroFiltro !== 'todos' && (
                  <>
                    {' '}
                    ·{' '}
                    {BARBEIROS_DEMO.find((b) => b.id === barbeiroFiltro)
                      ?.nome ?? 'Barbeiro'}
                  </>
                )}
              </p>
            </section>

            {/* Filtros */}
            <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <FiltroPeriodo
                  periodo={periodo}
                  customRange={customRange}
                  onPeriodoChange={handlePeriodoChange}
                  onCustomRangeChange={setCustomRange}
                  disabled={loading}
                />
              </div>
              {isAdmin && (
                <FiltroBarbeiro
                  barbeiros={BARBEIROS_DEMO}
                  value={barbeiroFiltro}
                  onChange={setBarbeiroFiltro}
                  disabled={loading}
                />
              )}
            </section>

            {/* Empty state global */}
            {!loading && !hasData && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-barber-black-soft px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-barber-gold/10">
                  <BarChart3 className="h-7 w-7 text-barber-gold/80" />
                </div>
                <h3 className="text-lg font-semibold text-barber-light">
                  Nenhum dado no período
                </h3>
                <p className="mt-1 max-w-sm text-sm text-barber-light/50">
                  Não há atendimentos ou faturamento para os filtros
                  selecionados. Tente outro período
                  {isAdmin ? ' ou barbeiro' : ''}.
                </p>
              </div>
            )}

            {/* Métricas */}
            {(loading || hasData) && (
              <section
                className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                aria-busy={loading}
              >
                <MetricCard
                  title="Faturamento total"
                  value={
                    loading
                      ? '…'
                      : formatCurrency(metricas?.faturamentoTotal ?? 0)
                  }
                  subtitle="atendimentos concluídos"
                  icon={DollarSign}
                  accent="gold"
                />
                <MetricCard
                  title="Atendimentos"
                  value={
                    loading
                      ? '…'
                      : String(metricas?.quantidadeAtendimentos ?? 0)
                  }
                  subtitle="concluídos + confirmados"
                  icon={CalendarCheck}
                  accent="default"
                />
                <MetricCard
                  title="Ticket médio"
                  value={
                    loading
                      ? '…'
                      : formatCurrency(metricas?.ticketMedio ?? 0)
                  }
                  subtitle="por atendimento"
                  icon={Receipt}
                  accent="green"
                />
                <MetricCard
                  title="Taxa de ocupação"
                  value={
                    loading
                      ? '…'
                      : `${(metricas?.taxaOcupacao ?? 0).toLocaleString('pt-BR', {
                          maximumFractionDigits: 1,
                        })}%`
                  }
                  subtitle="capacidade do período"
                  icon={Percent}
                  accent="red"
                />
              </section>
            )}

            {/* Gráficos */}
            {(loading || hasData) && (
              <>
                <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <GraficoFaturamento
                      data={relatorio?.faturamentoSerie ?? []}
                      loading={loading}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <GraficoServicos
                      data={relatorio?.servicosRanking ?? []}
                      loading={loading}
                    />
                  </div>
                </section>

                {isAdmin && (
                  <section>
                    <GraficoPerformanceBarbeiros
                      data={relatorio?.performanceBarbeiros ?? []}
                      loading={loading}
                    />
                  </section>
                )}

                {/* Tabelas */}
                <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <TabelaServicos
                    data={relatorio?.servicosRanking ?? []}
                    loading={loading}
                  />
                  <TabelaAtendimentos
                    data={relatorio?.atendimentosRecentes ?? []}
                    loading={loading}
                    showBarbeiro={isAdmin && barbeiroFiltro === 'todos'}
                  />
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function formatRangeLabel(range: DateRange): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    if (!y || !m || !d) return iso
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR')
  }
  if (range.inicio === range.fim) return fmt(range.inicio)
  return `${fmt(range.inicio)} — ${fmt(range.fim)}`
}
