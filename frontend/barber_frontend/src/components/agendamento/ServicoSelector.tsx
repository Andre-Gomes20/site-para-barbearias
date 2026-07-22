/**
 * Multi-seleção de serviços — nome, preço e duração.
 * Atualiza totais no componente pai via onChange.
 */

import { Check, Clock, Star } from 'lucide-react'
import type { Servico } from '../../types/agendamento'
import { formatCurrency, formatDuration } from '../../data/mockAgendamento'

interface ServicoSelectorProps {
  servicos: Servico[]
  selectedIds: string[]
  onChange: (selected: Servico[]) => void
  error?: string
}

export default function ServicoSelector({
  servicos,
  selectedIds,
  onChange,
  error,
}: ServicoSelectorProps) {
  function toggle(servico: Servico) {
    const isSelected = selectedIds.includes(servico.id)
    const nextIds = isSelected
      ? selectedIds.filter((id) => id !== servico.id)
      : [...selectedIds, servico.id]

    const next = servicos.filter((s) => nextIds.includes(s.id))
    onChange(next)
  }

  return (
    <section aria-labelledby="servicos-heading">
      <div className="mb-3">
        <h2
          id="servicos-heading"
          className="text-base sm:text-lg font-semibold text-barber-light"
        >
          2. Escolha os serviços
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          Você pode selecionar mais de um serviço
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
        role="group"
        aria-label="Serviços"
        aria-invalid={!!error}
      >
        {servicos.map((servico) => {
          const selected = selectedIds.includes(servico.id)
          return (
            <button
              key={servico.id}
              type="button"
              onClick={() => toggle(servico)}
              aria-pressed={selected}
              className={`relative flex min-h-[72px] w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                selected
                  ? 'border-barber-gold bg-barber-gold/10'
                  : 'border-white/8 bg-barber-black-soft hover:border-white/15'
              }`}
            >
              {/* Checkbox visual */}
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  selected
                    ? 'border-barber-gold bg-barber-gold text-barber-black'
                    : 'border-white/20 bg-transparent'
                }`}
                aria-hidden
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-barber-light leading-snug">
                    {servico.nome}
                  </p>
                  {servico.destaque && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-barber-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-barber-gold">
                      <Star className="h-2.5 w-2.5" fill="currentColor" />
                      Top
                    </span>
                  )}
                </div>

                {servico.descricao && (
                  <p className="mt-0.5 text-xs text-barber-light/45 line-clamp-1">
                    {servico.descricao}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-barber-light/50">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(servico.duracaoMinutos)}
                  </span>
                  <span className="text-sm font-bold text-barber-gold">
                    {formatCurrency(servico.preco)}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-barber-red" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
