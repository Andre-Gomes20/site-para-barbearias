/**
 * Filtros de data da Agenda do Barbeiro.
 * Hoje / Amanhã / Esta semana / Calendário
 */

import { CalendarDays, CalendarRange, Sun, Sunrise } from 'lucide-react'
import type { ComponentType } from 'react'
import type { FiltroDataId } from '../../types/agenda'

interface FiltroOption {
  id: FiltroDataId
  label: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
}

const OPTIONS: FiltroOption[] = [
  { id: 'hoje', label: 'Hoje', icon: Sun },
  { id: 'amanha', label: 'Amanhã', icon: Sunrise },
  { id: 'semana', label: 'Esta semana', icon: CalendarRange },
  { id: 'calendario', label: 'Calendário', icon: CalendarDays },
]

interface FiltroDataProps {
  value: FiltroDataId
  onChange: (filtro: FiltroDataId) => void
  /** Data ISO selecionada no calendário (quando filtro = calendario) */
  selectedDate?: string
  onDatePick?: (isoDate: string) => void
  className?: string
}

export default function FiltroData({
  value,
  onChange,
  selectedDate,
  onDatePick,
  className = '',
}: FiltroDataProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtrar agenda por data"
      >
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          const active = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.id)}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-barber-gold/40 bg-barber-gold/15 text-barber-gold'
                  : 'border-white/5 bg-barber-black-soft text-barber-light/65 hover:border-white/10 hover:bg-white/5 hover:text-barber-light'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {opt.label}
            </button>
          )
        })}
      </div>

      {value === 'calendario' && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-barber-black-soft p-3">
          <label
            htmlFor="agenda-date-picker"
            className="text-sm text-barber-light/60"
          >
            Escolha a data
          </label>
          <input
            id="agenda-date-picker"
            type="date"
            value={selectedDate ?? ''}
            onChange={(e) => onDatePick?.(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-barber-gray px-3 text-sm text-barber-light focus:border-barber-gold/50 focus:outline-none"
          />
        </div>
      )}
    </div>
  )
}
