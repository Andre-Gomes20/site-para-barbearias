/**
 * Tabela — Serviços mais realizados (nome, quantidade, valor total).
 */

import type { ServicoRanking } from '../../types/relatorio'
import { formatCurrency } from '../../data/mockRelatorios'

interface TabelaServicosProps {
  data: ServicoRanking[]
  loading?: boolean
}

export default function TabelaServicos({
  data,
  loading = false,
}: TabelaServicosProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-barber-light sm:text-xl">
          Serviços mais realizados
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          Ranking por quantidade no período
        </p>
      </div>

      {loading ? (
        <div className="space-y-2" role="status" aria-label="Carregando tabela">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-barber-light/50">
          Nenhum serviço no período.
        </p>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="space-y-2 sm:hidden">
            {data.map((s, idx) => (
              <li
                key={s.servicoId}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-barber-black/60 px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-barber-light">
                    <span className="mr-1.5 text-barber-gold/80 tabular-nums">
                      {idx + 1}.
                    </span>
                    {s.nome}
                  </p>
                  <p className="mt-0.5 text-xs text-barber-light/45">
                    {s.quantidade}{' '}
                    {s.quantidade === 1 ? 'atendimento' : 'atendimentos'}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-barber-gold">
                  {formatCurrency(s.valorTotal)}
                </p>
              </li>
            ))}
          </ul>

          {/* Desktop: tabela */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-barber-light/45">
                  <th className="pb-3 pr-3 font-medium">#</th>
                  <th className="pb-3 pr-3 font-medium">Serviço</th>
                  <th className="pb-3 pr-3 font-medium text-right">Qtd.</th>
                  <th className="pb-3 font-medium text-right">Valor total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s, idx) => (
                  <tr
                    key={s.servicoId}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 pr-3 tabular-nums text-barber-gold/80">
                      {idx + 1}
                    </td>
                    <td className="py-3 pr-3 font-medium text-barber-light">
                      {s.nome}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums text-barber-light/70">
                      {s.quantidade}
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums text-barber-gold">
                      {formatCurrency(s.valorTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
