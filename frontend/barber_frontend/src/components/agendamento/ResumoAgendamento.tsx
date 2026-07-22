/**
 * Resumo sticky do agendamento: barbeiro, serviços, data/hora, totais e CTA.
 * No mobile fica no fluxo; no desktop pode ser sticky no aside.
 */

import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Scissors,
  User,
  Wallet,
} from 'lucide-react'
import type { Barbeiro, Servico } from '../../types/agendamento'
import {
  formatCurrency,
  formatDateBR,
  formatDuration,
} from '../../data/mockAgendamento'

interface ResumoAgendamentoProps {
  barbeiro: Barbeiro | null
  servicos: Servico[]
  data: string | null
  hora: string | null
  valorTotal: number
  duracaoTotalMinutos: number
  canConfirm: boolean
  confirming: boolean
  onConfirm: () => void
}

function Placeholder({ text }: { text: string }) {
  return <span className="text-barber-light/35 italic">{text}</span>
}

export default function ResumoAgendamento({
  barbeiro,
  servicos,
  data,
  hora,
  valorTotal,
  duracaoTotalMinutos,
  canConfirm,
  confirming,
  onConfirm,
}: ResumoAgendamentoProps) {
  return (
    <aside
      className="rounded-2xl border border-barber-gold/25 bg-gradient-to-b from-barber-black-soft to-barber-gray/80 p-5 shadow-lg shadow-black/20"
      aria-labelledby="resumo-heading"
    >
      <h2
        id="resumo-heading"
        className="text-lg font-semibold text-barber-light flex items-center gap-2"
      >
        <CheckCircle2 className="h-5 w-5 text-barber-gold" />
        Resumo do agendamento
      </h2>
      <p className="mt-1 text-sm text-barber-light/50">
        Confira os detalhes antes de confirmar
      </p>

      <dl className="mt-5 space-y-4">
        {/* Barbeiro */}
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-barber-gold/15 text-barber-gold">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-barber-light/40">
              Barbeiro
            </dt>
            <dd className="mt-0.5 font-medium text-barber-light truncate">
              {barbeiro ? barbeiro.nome : <Placeholder text="Não selecionado" />}
            </dd>
            {barbeiro && (
              <p className="text-xs text-barber-light/45 truncate">
                {barbeiro.especialidade}
              </p>
            )}
          </div>
        </div>

        {/* Serviços */}
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-barber-gold/15 text-barber-gold">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-barber-light/40">
              Serviços
            </dt>
            <dd className="mt-1">
              {servicos.length === 0 ? (
                <Placeholder text="Nenhum serviço" />
              ) : (
                <ul className="space-y-1.5">
                  {servicos.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-barber-light truncate">{s.nome}</span>
                      <span className="shrink-0 text-barber-light/55">
                        {formatCurrency(s.preco)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        </div>

        {/* Data e hora */}
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-barber-gold/15 text-barber-gold">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-barber-light/40">
              Data e horário
            </dt>
            <dd className="mt-0.5 font-medium text-barber-light">
              {data ? (
                <>
                  {formatDateBR(data)}
                  {hora ? (
                    <span className="text-barber-gold"> · {hora}</span>
                  ) : (
                    <span className="text-barber-light/35"> · escolha o horário</span>
                  )}
                </>
              ) : (
                <Placeholder text="Data não selecionada" />
              )}
            </dd>
          </div>
        </div>

        {/* Duração e valor */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-4">
          <div className="rounded-xl bg-black/25 px-3 py-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-barber-light/40">
              <Clock className="h-3.5 w-3.5" />
              Duração
            </p>
            <p className="mt-1 text-base font-semibold text-barber-light">
              {duracaoTotalMinutos > 0
                ? formatDuration(duracaoTotalMinutos)
                : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-barber-gold/10 px-3 py-3 ring-1 ring-barber-gold/20">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-barber-gold/80">
              <Wallet className="h-3.5 w-3.5" />
              Total
            </p>
            <p className="mt-1 text-base font-bold text-barber-gold">
              {valorTotal > 0 ? formatCurrency(valorTotal) : '—'}
            </p>
          </div>
        </div>
      </dl>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm || confirming}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-barber-gold px-4 py-3 text-[15px] font-bold text-barber-black transition-all hover:bg-barber-gold-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100"
      >
        {confirming ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Confirmando…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Confirmar Agendamento
          </>
        )}
      </button>

      {!canConfirm && !confirming && (
        <p className="mt-2.5 text-center text-xs text-barber-light/40">
          Preencha barbeiro, serviços, data e horário
        </p>
      )}
    </aside>
  )
}
