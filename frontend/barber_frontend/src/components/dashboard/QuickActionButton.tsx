/**
 * Botão de ação rápida — grande o suficiente para toque em mobile.
 */

import type { LucideIcon } from 'lucide-react'

interface QuickActionButtonProps {
  label: string
  icon: LucideIcon
  onClick?: () => void
  variant?: 'gold' | 'outline' | 'red'
}

const variants = {
  gold: 'bg-barber-gold text-barber-black hover:bg-barber-gold-hover border-transparent',
  outline:
    'bg-transparent text-barber-light border-white/15 hover:border-barber-gold/50 hover:text-barber-gold',
  red: 'bg-barber-red text-white hover:bg-barber-red-dark border-transparent',
}

export default function QuickActionButton({
  label,
  icon: Icon,
  onClick,
  variant = 'gold',
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-[15px] font-semibold transition-colors active:scale-[0.98] ${variants[variant]}`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} />
      {label}
    </button>
  )
}
