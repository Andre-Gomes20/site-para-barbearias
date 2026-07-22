/**
 * Card de agendamento da Agenda do Barbeiro.
 * Exibe horário, duração, serviço, cliente, valor, status e ações.
 */

import { Ban, CheckCircle2, Users } from 'lucide-react'
import type { Agendamento, AgendamentoStatus } from '../../types/agenda'
import { formatCurrency, formatDuration } from '../../data/mockAgenda'

const STATUS_DOT: Record<AgendamentoStatus, string> = {
  concluido: 'bg-emerald-400',
  pendente: 'bg-barber-gold',
  cancelado: 'bg-barber-red',
  confirmado: 'bg-sky-400',
}

const STATUS_LABEL: Record<AgendamentoStatus, string> = {
  concluido: 'Concluído',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
  confirmado: 'Confirmado',
}

const STATUS_BADGE: Record<AgendamentoStatus, string> = {
  concluido: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  pendente: 'bg-barber-gold/15 text-barber-gold border-barber-gold/30',
  cancelado: 'bg-barber-red/15 text-barber-red border-barber-red/30',
  confirmado: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
}

interface AgendamentoCardProps {
  agendamento: Agendamento
  onConcluir?: (id: string) => void
  onCancelar?: (id: string) => void
  /** Desabilita ações (ex.: durante loading) */
  actionsDisabled?: boolean
}

export default function AgendamentoCard({
  agendamento,
  onConcluir,
  onCancelar,
  actionsDisabled = false,
}: AgendamentoCardProps) {
  const { status } = agendamento
  const isFinal = status === 'concluido' || status === 'cancelado'
  const canAct = !isFinal && !actionsDisabled

  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border border-white/5 bg-barber-black-soft p-3.5 sm:flex-row sm:items-stretch sm:gap-0 sm:p-4 ${
        status === 'cancelado' ? 'opacity-70' : ''
      }`}
      aria-label={`Agendamento ${agendamento.ordem}: ${agendamento.servico} às ${agendamento.horario}`}
    >
      {/* Horário */}
      <div className="flex w-full shrink-0 items-center gap-3 border-b border-white/5 pb-3 sm:w-20 sm:flex-col sm:items-center sm:justify-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
        <span className="text-lg font-bold tabular-nums text-barber-gold sm:text-xl">
          {agendamento.horario}
        </span>
        <span className="text-xs text-barber-light/40">
          {formatDuration(agendamento.duracaoMin)}
        </span>
      </div>

      {/* Conteúdo principal */}
      <div className="min-w-0 flex-1 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-barber-light">{agendamento.servico}</h3>
          <span
            className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[status]}`}
            title={STATUS_LABEL[status]}
            aria-hidden
          />
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGE[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-barber-light/55">
          <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{agendamento.cliente}</span>
        </p>

        <p className="mt-1.5 text-sm font-semibold text-barber-gold/90">
          {formatCurrency(agendamento.valor)}
        </p>

        {agendamento.observacao && (
          <p className="mt-1 text-xs text-barber-light/40 italic">
            {agendamento.observacao}
          </p>
        )}

        {/* Ações — mobile abaixo do conteúdo */}
        {canAct && (
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <ActionButtons
              id={agendamento.id}
              onConcluir={onConcluir}
              onCancelar={onCancelar}
              disabled={actionsDisabled}
            />
          </div>
        )}
      </div>

      {/* Ordem + ações desktop */}
      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-between sm:pl-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-barber-light/40"
          title={`Ordem ${agendamento.ordem}`}
        >
          #{agendamento.ordem}
        </span>

        {canAct && (
          <div className="hidden sm:flex sm:flex-col sm:gap-2">
            <ActionButtons
              id={agendamento.id}
              onConcluir={onConcluir}
              onCancelar={onCancelar}
              disabled={actionsDisabled}
              compact
            />
          </div>
        )}
      </div>
    </article>
  )
}

function ActionButtons({
  id,
  onConcluir,
  onCancelar,
  disabled,
  compact = false,
}: {
  id: string
  onConcluir?: (id: string) => void
  onCancelar?: (id: string) => void
  disabled?: boolean
  compact?: boolean
}) {
  const btnBase =
    'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const size = compact ? 'h-9 px-2.5 text-xs' : 'min-h-[40px] px-3 text-sm'

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onConcluir?.(id)}
        className={`${btnBase} ${size} border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20`}
        title="Marcar como concluído"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Concluir
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onCancelar?.(id)}
        className={`${btnBase} ${size} border border-barber-red/30 bg-barber-red/10 text-barber-red hover:bg-barber-red/20`}
        title="Cancelar agendamento"
      >
        <Ban className="h-4 w-4 shrink-0" />
        Cancelar
      </button>
    </>
  )
}

/** Slot livre entre agendamentos */
export function SlotLivreCard({
  horarioInicio,
  horarioFim,
  duracaoMin,
}: {
  horarioInicio: string
  horarioFim: string
  duracaoMin: number
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-dashed border-barber-gold/25 bg-barber-gold/5 px-4 py-2.5"
      role="status"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-barber-gold/60" />
      <p className="text-sm text-barber-light/55">
        <span className="font-medium text-barber-gold/80">Horário livre</span>
        {' · '}
        {horarioInicio} – {horarioFim}
        <span className="text-barber-light/40">
          {' '}
          ({formatDuration(duracaoMin)})
        </span>
      </p>
    </div>
  )
}
