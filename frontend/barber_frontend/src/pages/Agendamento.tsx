/**
 * Página: Novo Agendamento (cliente)
 *
 * Fluxo:
 *  1. Selecionar barbeiro
 *  2. Multi-selecionar serviços (totais automáticos)
 *  3. Escolher data → carrega horários livres do barbeiro
 *  4. Escolher horário disponível
 *  5. Confirmar → sucesso → redireciona ao Dashboard
 *
 * Layout mobile-first com resumo sticky no desktop.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { Barbeiro, HorarioSlot, Servico } from '../types/agendamento'
import {
  BARBEIROS,
  SERVICOS,
  calcTotais,
  confirmarAgendamentoMock,
  fetchHorariosDisponiveis,
  formatCurrency,
  formatDateBR,
  formatDuration,
} from '../data/mockAgendamento'
import BarbeiroSelector from '../components/agendamento/BarbeiroSelector'
import ServicoSelector from '../components/agendamento/ServicoSelector'
import HorarioSelector from '../components/agendamento/HorarioSelector'
import ResumoAgendamento from '../components/agendamento/ResumoAgendamento'

interface FormErrors {
  barbeiro?: string
  servicos?: string
  data?: string
  hora?: string
}

export default function Agendamento() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  // ── Estado do formulário ─────────────────────────────────────────────────
  const [barbeiro, setBarbeiro] = useState<Barbeiro | null>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [data, setData] = useState<string | null>(null)
  const [hora, setHora] = useState<string | null>(null)

  // ── Horários (API mock) ──────────────────────────────────────────────────
  const [slots, setSlots] = useState<HorarioSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // ── UI ───────────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<FormErrors>({})
  const [confirming, setConfirming] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const { valorTotal, duracaoTotalMinutos } = useMemo(
    () => calcTotais(servicos),
    [servicos],
  )

  const canConfirm = Boolean(
    barbeiro && servicos.length > 0 && data && hora && !confirming,
  )

  // ── Carrega horários quando barbeiro + data mudam ────────────────────────
  useEffect(() => {
    if (!barbeiro || !data) {
      setSlots([])
      return
    }

    let cancelled = false
    setLoadingSlots(true)
    setHora(null) // limpa hora ao trocar dia/barbeiro
    setErrors((prev) => ({ ...prev, hora: undefined }))

    fetchHorariosDisponiveis(barbeiro.id, data)
      .then((result) => {
        if (!cancelled) setSlots(result)
      })
      .catch(() => {
        if (!cancelled) setSlots([])
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })

    return () => {
      cancelled = true
    }
  }, [barbeiro, data])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectBarbeiro = useCallback((b: Barbeiro) => {
    setBarbeiro(b)
    setErrors((prev) => ({ ...prev, barbeiro: undefined }))
    // Ao trocar barbeiro, limpa data/hora para forçar revalidação da agenda
    setHora(null)
  }, [])

  const handleServicosChange = useCallback((selected: Servico[]) => {
    setServicos(selected)
    setErrors((prev) => ({
      ...prev,
      servicos: selected.length ? undefined : prev.servicos,
    }))
  }, [])

  const handleDateChange = useCallback((iso: string) => {
    setData(iso)
    setErrors((prev) => ({ ...prev, data: undefined, hora: undefined }))
  }, [])

  const handleHoraChange = useCallback((h: string) => {
    setHora(h)
    setErrors((prev) => ({ ...prev, hora: undefined }))
  }, [])

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!barbeiro) next.barbeiro = 'Selecione um barbeiro para continuar.'
    if (servicos.length === 0) next.servicos = 'Selecione ao menos um serviço.'
    if (!data) next.data = 'Escolha uma data no calendário.'
    if (!hora) next.hora = 'Escolha um horário disponível.'
    return next
  }

  async function handleConfirm() {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      // Scroll suave para o primeiro erro
      const firstKey = Object.keys(nextErrors)[0]
      const el = document.getElementById(
        firstKey === 'barbeiro'
          ? 'barbeiro-heading'
          : firstKey === 'servicos'
            ? 'servicos-heading'
            : 'horario-heading',
      )
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (!barbeiro || !data || !hora) return

    setConfirming(true)
    try {
      await confirmarAgendamentoMock({
        barbeiroId: barbeiro.id,
        servicoIds: servicos.map((s) => s.id),
        data,
        hora,
        valorTotal,
        duracaoTotalMinutos,
      })
      setSuccessOpen(true)
    } catch {
      setErrors({ hora: 'Não foi possível confirmar. Tente novamente.' })
    } finally {
      setConfirming(false)
    }
  }

  function handleSuccessClose() {
    setSuccessOpen(false)
    navigate('/dashboard', { replace: true })
  }

  // ── Guards de auth ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-barber-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-barber-gold border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-svh bg-barber-black text-barber-light">
      {/* Header da página */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-barber-black/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-barber-light/80 transition-colors hover:border-barber-gold/40 hover:text-barber-gold"
            aria-label="Voltar ao Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">Voltar</span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 shrink-0 text-barber-gold" />
              <h1 className="truncate text-base sm:text-lg font-bold text-barber-light">
                Novo Agendamento
              </h1>
            </div>
            <p className="hidden sm:block text-xs text-barber-light/45 truncate">
              Reserve seu horário em poucos passos
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* Coluna do formulário */}
          <div className="space-y-8">
            <BarbeiroSelector
              barbeiros={BARBEIROS}
              selectedId={barbeiro?.id ?? null}
              onSelect={handleSelectBarbeiro}
              error={errors.barbeiro}
            />

            <div className="h-px bg-white/5" aria-hidden />

            <ServicoSelector
              servicos={SERVICOS}
              selectedIds={servicos.map((s) => s.id)}
              onChange={handleServicosChange}
              error={errors.servicos}
            />

            <div className="h-px bg-white/5" aria-hidden />

            <HorarioSelector
              selectedDate={data}
              selectedHora={hora}
              slots={slots}
              loading={loadingSlots}
              disabled={!barbeiro}
              onDateChange={handleDateChange}
              onHoraChange={handleHoraChange}
              dateError={errors.data}
              horaError={errors.hora}
            />

            {/* Resumo compacto no mobile (antes do botão sticky implícito) */}
            <div className="lg:hidden">
              <ResumoAgendamento
                barbeiro={barbeiro}
                servicos={servicos}
                data={data}
                hora={hora}
                valorTotal={valorTotal}
                duracaoTotalMinutos={duracaoTotalMinutos}
                canConfirm={canConfirm}
                confirming={confirming}
                onConfirm={handleConfirm}
              />
            </div>
          </div>

          {/* Coluna sticky (desktop) */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <ResumoAgendamento
              barbeiro={barbeiro}
              servicos={servicos}
              data={data}
              hora={hora}
              valorTotal={valorTotal}
              duracaoTotalMinutos={duracaoTotalMinutos}
              canConfirm={canConfirm}
              confirming={confirming}
              onConfirm={handleConfirm}
            />
          </div>
        </div>
      </main>

      {/* Modal de sucesso */}
      {successOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-barber-gold/30 bg-barber-black-soft p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={handleSuccessClose}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl text-barber-light/50 hover:bg-white/5 hover:text-barber-light"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-barber-gold/15 text-barber-gold">
                <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
              </div>
              <h2
                id="success-title"
                className="mt-4 text-xl font-bold text-barber-light"
              >
                Agendamento confirmado!
              </h2>
              <p className="mt-2 text-sm text-barber-light/60">
                Seu horário foi reservado com sucesso. Você pode acompanhar
                tudo no Dashboard.
              </p>

              {barbeiro && data && hora && (
                <div className="mt-5 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-left text-sm space-y-2">
                  <p>
                    <span className="text-barber-light/45">Barbeiro: </span>
                    <span className="font-medium text-barber-light">
                      {barbeiro.nome}
                    </span>
                  </p>
                  <p>
                    <span className="text-barber-light/45">Quando: </span>
                    <span className="font-medium text-barber-light">
                      {formatDateBR(data)} às {hora}
                    </span>
                  </p>
                  <p>
                    <span className="text-barber-light/45">Serviços: </span>
                    <span className="font-medium text-barber-light">
                      {servicos.map((s) => s.nome).join(', ')}
                    </span>
                  </p>
                  <p>
                    <span className="text-barber-light/45">Total: </span>
                    <span className="font-bold text-barber-gold">
                      {formatCurrency(valorTotal)}
                    </span>
                    <span className="text-barber-light/45">
                      {' '}
                      · {formatDuration(duracaoTotalMinutos)}
                    </span>
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSuccessClose}
                className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-barber-gold px-4 py-3 text-[15px] font-bold text-barber-black transition-colors hover:bg-barber-gold-hover"
              >
                Ir para o Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
