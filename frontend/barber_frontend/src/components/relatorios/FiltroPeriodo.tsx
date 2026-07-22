/**
 * Filtro de período: Hoje / Esta semana / Este mês / Personalizado.
 */

import type { DateRange, PeriodoId } from '../../types/relatorio'

const OPCOES: { id: PeriodoId; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mês' },
  { id: 'personalizado', label: 'Personalizado' },
]

interface FiltroPeriodoProps {
  periodo: PeriodoId
  customRange: DateRange
  onPeriodoChange: (periodo: PeriodoId) => void
  onCustomRangeChange: (range: DateRange) => void
  disabled?: boolean
}

export default function FiltroPeriodo({
  periodo,
  customRange,
  onPeriodoChange,
  onCustomRangeChange,
  disabled = false,
}: FiltroPeriodoProps) {
  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-1.5 rounded-xl border border-white/5 bg-barber-black-soft p-1"
        role="tablist"
        aria-label="Filtrar por período"
      >
        {OPCOES.map((opt) => {
          const active = periodo === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onPeriodoChange(opt.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 sm:px-3.5 ${
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

      {periodo === 'personalizado' && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-barber-black-soft p-3 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1">
            <span className="mb-1.5 block text-xs font-medium text-barber-light/55">
              Data início
            </span>
            <input
              type="date"
              value={customRange.inicio}
              max={customRange.fim || undefined}
              disabled={disabled}
              onChange={(e) =>
                onCustomRangeChange({
                  ...customRange,
                  inicio: e.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-barber-black px-3 text-sm text-barber-light focus:border-barber-gold/50 focus:outline-none focus:ring-1 focus:ring-barber-gold/40 disabled:opacity-50 [color-scheme:dark]"
            />
          </label>
          <label className="block min-w-0 flex-1">
            <span className="mb-1.5 block text-xs font-medium text-barber-light/55">
              Data fim
            </span>
            <input
              type="date"
              value={customRange.fim}
              min={customRange.inicio || undefined}
              disabled={disabled}
              onChange={(e) =>
                onCustomRangeChange({
                  ...customRange,
                  fim: e.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-barber-black px-3 text-sm text-barber-light focus:border-barber-gold/50 focus:outline-none focus:ring-1 focus:ring-barber-gold/40 disabled:opacity-50 [color-scheme:dark]"
            />
          </label>
        </div>
      )}
    </div>
  )
}
