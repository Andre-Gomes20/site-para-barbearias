/**
 * Seleção de barbeiro — cards com foto, nome e especialidade.
 * Mobile-first: lista vertical no celular, grid no desktop.
 */

import { Check, Star, User } from 'lucide-react'
import type { Barbeiro } from '../../types/agendamento'

interface BarbeiroSelectorProps {
  barbeiros: Barbeiro[]
  selectedId: string | null
  onSelect: (barbeiro: Barbeiro) => void
  error?: string
}

export default function BarbeiroSelector({
  barbeiros,
  selectedId,
  onSelect,
  error,
}: BarbeiroSelectorProps) {
  return (
    <section aria-labelledby="barbeiro-heading">
      <div className="mb-3">
        <h2
          id="barbeiro-heading"
          className="text-base sm:text-lg font-semibold text-barber-light"
        >
          1. Escolha o barbeiro
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          Selecione o profissional que vai te atender
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        role="listbox"
        aria-label="Barbeiros disponíveis"
        aria-invalid={!!error}
      >
        {barbeiros.map((barbeiro) => {
          const selected = barbeiro.id === selectedId
          return (
            <button
              key={barbeiro.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(barbeiro)}
              className={`group relative flex min-h-[88px] w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                selected
                  ? 'border-barber-gold bg-barber-gold/10 shadow-[0_0_0_1px_rgba(212,175,55,0.35)]'
                  : 'border-white/8 bg-barber-black-soft hover:border-white/15 hover:bg-barber-gray/60'
              }`}
            >
              {/* Avatar */}
              <div
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 ${
                  selected ? 'border-barber-gold' : 'border-white/10'
                }`}
              >
                {barbeiro.fotoUrl ? (
                  <img
                    src={barbeiro.fotoUrl}
                    alt=""
                    className="h-full w-full object-cover bg-barber-gray"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-barber-gray text-barber-gold">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-barber-light">
                  {barbeiro.nome}
                </p>
                <p className="mt-0.5 truncate text-sm text-barber-light/55">
                  {barbeiro.especialidade}
                </p>
                {(barbeiro.avaliacao != null || barbeiro.experienciaAnos != null) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-barber-light/45">
                    {barbeiro.avaliacao != null && (
                      <span className="inline-flex items-center gap-1 text-barber-gold">
                        <Star className="h-3 w-3" fill="currentColor" />
                        {barbeiro.avaliacao.toFixed(1)}
                      </span>
                    )}
                    {barbeiro.experienciaAnos != null && (
                      <span>{barbeiro.experienciaAnos} anos</span>
                    )}
                  </div>
                )}
              </div>

              {/* Check de seleção */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                  selected
                    ? 'bg-barber-gold text-barber-black'
                    : 'border border-white/15 text-transparent group-hover:border-white/25'
                }`}
                aria-hidden
              >
                <Check className="h-4 w-4" strokeWidth={3} />
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
