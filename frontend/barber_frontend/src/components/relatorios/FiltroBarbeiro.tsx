/**
 * Seletor de barbeiro (apenas Admin).
 */

import { UserRound } from 'lucide-react'
import type { BarbeiroOption } from '../../types/relatorio'

interface FiltroBarbeiroProps {
  barbeiros: BarbeiroOption[]
  value: string
  onChange: (barbeiroId: string) => void
  disabled?: boolean
}

export default function FiltroBarbeiro({
  barbeiros,
  value,
  onChange,
  disabled = false,
}: FiltroBarbeiroProps) {
  return (
    <label className="block w-full sm:max-w-xs">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-barber-light/55">
        <UserRound className="h-3.5 w-3.5 text-barber-gold/80" aria-hidden />
        Barbeiro
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-white/10 bg-barber-black-soft px-3 text-sm font-medium text-barber-light focus:border-barber-gold/50 focus:outline-none focus:ring-1 focus:ring-barber-gold/40 disabled:opacity-50"
        aria-label="Filtrar por barbeiro"
      >
        <option value="todos">Todos os barbeiros</option>
        {barbeiros.map((b) => (
          <option key={b.id} value={b.id}>
            {b.nome}
          </option>
        ))}
      </select>
    </label>
  )
}
