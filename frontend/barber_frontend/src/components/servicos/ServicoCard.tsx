/**
 * Card de serviço do barbeiro.
 * Exibe nome, descrição, duração, preço, status e ações Editar / Excluir.
 */

import { Clock3, Pencil, Trash2 } from 'lucide-react'
import type { Servico } from '../../types/servico'
import { formatCurrency, formatDuration } from '../../data/mockServicos'

interface ServicoCardProps {
  servico: Servico
  onEdit: (servico: Servico) => void
  onDelete: (servico: Servico) => void
  /** Desabilita botões durante operações assíncronas */
  actionsDisabled?: boolean
}

export default function ServicoCard({
  servico,
  onEdit,
  onDelete,
  actionsDisabled = false,
}: ServicoCardProps) {
  const { nome, descricao, duracaoMinutos, preco, ativo } = servico

  return (
    <article
      className={`flex flex-col rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-5 transition-opacity ${
        !ativo ? 'opacity-75' : ''
      }`}
      aria-label={`Serviço: ${nome}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-barber-light sm:text-lg">
              {nome}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                ativo
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                  : 'border-white/15 bg-white/5 text-barber-light/50'
              }`}
            >
              {ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          {descricao ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-barber-light/55">
              {descricao}
            </p>
          ) : (
            <p className="mt-1.5 text-sm italic text-barber-light/35">
              Sem descrição
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5 text-sm text-barber-light/60">
          <Clock3 className="h-4 w-4 text-barber-gold/80" aria-hidden />
          <span>{formatDuration(duracaoMinutos)}</span>
        </div>
        <span className="text-barber-light/20" aria-hidden>
          ·
        </span>
        <p className="text-base font-semibold tabular-nums text-barber-gold">
          {formatCurrency(preco)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(servico)}
          disabled={actionsDisabled}
          className="inline-flex h-10 min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-barber-light transition-colors hover:border-barber-gold/40 hover:bg-barber-gold/10 hover:text-barber-gold disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(servico)}
          disabled={actionsDisabled}
          className="inline-flex h-10 min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-barber-light/80 transition-colors hover:border-barber-red/40 hover:bg-barber-red/10 hover:text-barber-red disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Excluir
        </button>
      </div>
    </article>
  )
}
