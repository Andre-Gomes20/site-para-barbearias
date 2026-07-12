/**
 * Card de agendamento reutilizável (cliente / listas do dia).
 */

import { Calendar, Clock, MapPin, Scissors, User } from 'lucide-react'

export type AppointmentStatus = 'confirmado' | 'pendente' | 'concluido' | 'cancelado'

export interface Appointment {
  id: string
  service: string
  barber?: string
  client?: string
  date: string
  time: string
  price?: string
  status: AppointmentStatus
  location?: string
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmado: 'bg-barber-gold/15 text-barber-gold border-barber-gold/30',
  pendente: 'bg-barber-red/15 text-barber-red border-barber-red/30',
  concluido: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelado: 'bg-white/5 text-barber-light/40 border-white/10',
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

interface AppointmentCardProps {
  appointment: Appointment
  /** Exibe nome do barbeiro (visão cliente) ou do cliente (visão barbeiro/admin) */
  personMode?: 'barber' | 'client'
  compact?: boolean
}

export default function AppointmentCard({
  appointment,
  personMode = 'barber',
  compact = false,
}: AppointmentCardProps) {
  const person =
    personMode === 'barber' ? appointment.barber : appointment.client

  return (
    <article
      className={`rounded-2xl border border-white/5 bg-barber-black-soft ${
        compact ? 'p-3.5' : 'p-4 sm:p-5'
      } shadow-lg shadow-black/15`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-barber-gold/15 text-barber-gold">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-barber-light truncate">{appointment.service}</h3>
            {person && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-barber-light/55">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{person}</span>
              </p>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[appointment.status]}`}
        >
          {STATUS_LABEL[appointment.status]}
        </span>
      </div>

      <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-barber-light/60 ${compact ? '' : 'sm:mt-4'}`}>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-barber-gold/80" />
          {appointment.date}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-barber-gold/80" />
          {appointment.time}
        </span>
        {appointment.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-barber-gold/80" />
            {appointment.location}
          </span>
        )}
        {appointment.price && (
          <span className="ml-auto font-semibold text-barber-gold">{appointment.price}</span>
        )}
      </div>
    </article>
  )
}
