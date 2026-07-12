/**
 * Card de métrica reutilizável (admin / barbeiro).
 * Mobile-first: área de toque confortável e tipografia legível.
 */

import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  /** Cor do ícone/accent: gold | red | green | default */
  accent?: 'gold' | 'red' | 'green' | 'default'
  trend?: string
}

const accentStyles = {
  gold: 'bg-barber-gold/15 text-barber-gold',
  red: 'bg-barber-red/15 text-barber-red',
  green: 'bg-barber-green/40 text-emerald-300',
  default: 'bg-barber-gray text-barber-light',
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'gold',
  trend,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-barber-light/60 truncate">{title}</p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-barber-light">
            {value}
          </p>
          {(subtitle || trend) && (
            <p className="mt-1 text-xs sm:text-sm text-barber-light/50">
              {trend && (
                <span className="text-barber-gold font-medium mr-1.5">{trend}</span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </article>
  )
}
