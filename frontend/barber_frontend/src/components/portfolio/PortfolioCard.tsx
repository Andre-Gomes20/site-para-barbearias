/**
 * Card de item do portfólio do barbeiro.
 * Exibe imagem, legenda, data de postagem e botão de excluir.
 */

import { Calendar, Trash2 } from 'lucide-react'
import type { PortfolioItem } from '../../types/portfolio'
import { formatDataPostagem } from '../../data/mockPortfolio'

interface PortfolioCardProps {
  item: PortfolioItem
  onDelete: (item: PortfolioItem) => void
  /** Desabilita ações durante operações assíncronas */
  actionsDisabled?: boolean
}

export default function PortfolioCard({
  item,
  onDelete,
  actionsDisabled = false,
}: PortfolioCardProps) {
  const { urlImagem, legenda, dataPostagem, categoria } = item
  const dataFormatada = formatDataPostagem(dataPostagem)
  const altText = legenda?.trim() || 'Foto do portfólio'

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-barber-black-soft transition-shadow hover:shadow-lg hover:shadow-black/30"
      aria-label={altText}
    >
      {/* Imagem */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-barber-gray">
        <img
          src={urlImagem}
          alt={altText}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {categoria && (
          <span className="absolute top-3 left-3 rounded-full border border-barber-gold/30 bg-barber-black/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-barber-gold backdrop-blur-sm">
            {categoria}
          </span>
        )}
        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={actionsDisabled}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-barber-black/80 text-barber-light/80 backdrop-blur-sm transition-colors hover:border-barber-red/50 hover:bg-barber-red/20 hover:text-barber-red disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Excluir foto: ${altText}`}
          title="Excluir foto"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {legenda?.trim() ? (
          <p className="line-clamp-2 text-sm font-medium text-barber-light">
            {legenda.trim()}
          </p>
        ) : (
          <p className="text-sm italic text-barber-light/40">Sem legenda</p>
        )}
        <div className="mt-auto flex items-center gap-1.5 text-xs text-barber-light/50">
          <Calendar className="h-3.5 w-3.5 text-barber-gold/70" aria-hidden />
          <time dateTime={dataPostagem}>{dataFormatada}</time>
        </div>
      </div>
    </article>
  )
}
