/**
 * Calendário + lista de horários disponíveis do barbeiro.
 * - Date picker mensal (sem lib externa)
 * - Slots carregados via prop (loading / empty / lista)
 * - Só permite selecionar horários com disponivel === true
 */

import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react'
import type { HorarioSlot } from '../../types/agendamento'
import { formatDateISO } from '../../data/mockAgendamento'

interface HorarioSelectorProps {
  /** Data selecionada em ISO (YYYY-MM-DD) */
  selectedDate: string | null
  /** Hora selecionada (HH:mm) */
  selectedHora: string | null
  slots: HorarioSlot[]
  loading: boolean
  /** true se barbeiro ainda não foi escolhido */
  disabled?: boolean
  onDateChange: (isoDate: string) => void
  onHoraChange: (hora: string) => void
  dateError?: string
  horaError?: string
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/** Início do dia local (meia-noite) */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export default function HorarioSelector({
  selectedDate,
  selectedHora,
  slots,
  loading,
  disabled = false,
  onDateChange,
  onHoraChange,
  dateError,
  horaError,
}: HorarioSelectorProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  /** Células do calendário (null = dia vazio no grid) */
  const days = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [year, month])

  function canSelectDay(day: number): boolean {
    const date = new Date(year, month, day)
    return date >= today
  }

  function handleDayClick(day: number) {
    if (!canSelectDay(day) || disabled) return
    const iso = formatDateISO(new Date(year, month, day))
    onDateChange(iso)
  }

  function prevMonth() {
    setViewMonth(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setViewMonth(new Date(year, month + 1, 1))
  }

  // Não permite voltar a meses anteriores ao atual
  const canGoPrev =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())

  const disponiveis = slots.filter((s) => s.disponivel)
  const ocupados = slots.filter((s) => !s.disponivel)

  return (
    <section aria-labelledby="horario-heading" className="space-y-5">
      <div>
        <h2
          id="horario-heading"
          className="text-base sm:text-lg font-semibold text-barber-light"
        >
          3. Data e horário
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          {disabled
            ? 'Selecione um barbeiro para ver os horários'
            : 'Escolha o dia e um horário livre'}
        </p>
      </div>

      <div
        className={`grid gap-5 lg:grid-cols-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* ── Calendário ── */}
        <div className="rounded-2xl border border-white/8 bg-barber-black-soft p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-barber-light/70 transition-colors hover:bg-white/5 hover:text-barber-light disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="flex items-center gap-2 text-sm font-semibold text-barber-light">
              <CalendarDays className="h-4 w-4 text-barber-gold" />
              {MONTHS[month]} {year}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-barber-light/70 transition-colors hover:bg-white/5 hover:text-barber-light"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-barber-light/40"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendário">
            {days.map((day, idx) => {
              if (day == null) {
                return <div key={`e-${idx}`} className="aspect-square" />
              }

              const iso = formatDateISO(new Date(year, month, day))
              const isSelected = selectedDate === iso
              const isToday = formatDateISO(today) === iso
              const selectable = canSelectDay(day)

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!selectable}
                  onClick={() => handleDayClick(day)}
                  aria-pressed={isSelected}
                  aria-label={`${day} de ${MONTHS[month]}`}
                  className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-colors min-h-[40px] ${
                    isSelected
                      ? 'bg-barber-gold text-barber-black shadow-sm'
                      : selectable
                        ? isToday
                          ? 'bg-barber-red/15 text-barber-light ring-1 ring-barber-red/40 hover:bg-barber-gold/20'
                          : 'text-barber-light hover:bg-white/8'
                        : 'text-barber-light/25 cursor-not-allowed'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {dateError && (
            <p className="mt-3 text-sm text-barber-red" role="alert">
              {dateError}
            </p>
          )}
        </div>

        {/* ── Horários ── */}
        <div className="rounded-2xl border border-white/8 bg-barber-black-soft p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-barber-light">
              <Clock className="h-4 w-4 text-barber-gold" />
              Horários disponíveis
            </p>
            {selectedDate && !loading && (
              <span className="text-xs text-barber-light/45">
                {disponiveis.length} livres · {ocupados.length} ocupados
              </span>
            )}
          </div>

          {!selectedDate && (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
              <CalendarDays className="h-8 w-8 text-barber-light/25" />
              <p className="text-sm text-barber-light/45">
                Selecione uma data no calendário
              </p>
            </div>
          )}

          {selectedDate && loading && (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-barber-gold" />
              <p className="text-sm text-barber-light/55">
                Carregando horários…
              </p>
            </div>
          )}

          {selectedDate && !loading && slots.length === 0 && (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 py-8 text-center">
              <p className="text-sm text-barber-light/55">
                Nenhum horário cadastrado para este dia.
              </p>
            </div>
          )}

          {selectedDate && !loading && slots.length > 0 && disponiveis.length === 0 && (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 py-8 text-center">
              <p className="text-sm text-barber-light/55">
                Todos os horários estão ocupados neste dia.
              </p>
              <p className="text-xs text-barber-light/40">
                Tente outra data ou outro barbeiro.
              </p>
            </div>
          )}

          {selectedDate && !loading && slots.length > 0 && (
            <div
              className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-2"
              role="listbox"
              aria-label="Horários do dia"
            >
              {slots.map((slot) => {
                const isSelected = selectedHora === slot.hora
                const free = slot.disponivel

                return (
                  <button
                    key={slot.hora}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={!free}
                    onClick={() => free && onHoraChange(slot.hora)}
                    className={`min-h-[44px] rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                      isSelected
                        ? 'border-barber-gold bg-barber-gold text-barber-black'
                        : free
                          ? 'border-barber-gold/30 bg-barber-gold/10 text-barber-gold hover:bg-barber-gold/20'
                          : 'border-white/5 bg-white/[0.03] text-barber-light/30 line-through cursor-not-allowed'
                    }`}
                    title={free ? `Selecionar ${slot.hora}` : 'Horário ocupado'}
                  >
                    {slot.hora}
                  </button>
                )
              })}
            </div>
          )}

          {horaError && (
            <p className="mt-3 text-sm text-barber-red" role="alert">
              {horaError}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
