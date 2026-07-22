/**
 * Tabela opcional — Atendimentos recentes do período.
 */

import type { AtendimentoRelatorio } from '../../types/relatorio'
import {
  formatCurrency,
  labelStatus,
} from '../../data/mockRelatorios'

interface TabelaAtendimentosProps {
  data: AtendimentoRelatorio[]
  loading?: boolean
  /** Exibe coluna de barbeiro (admin) */
  showBarbeiro?: boolean
}

const STATUS_STYLE: Record<
  AtendimentoRelatorio['status'],
  string
> = {
  concluido: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
  confirmado: 'border-barber-gold/30 bg-barber-gold/15 text-barber-gold',
  pendente: 'border-barber-red/30 bg-barber-red/15 text-barber-red',
  cancelado: 'border-white/15 bg-white/5 text-barber-light/50',
  no_show: 'border-white/15 bg-white/5 text-barber-light/50',
}

export default function TabelaAtendimentos({
  data,
  loading = false,
  showBarbeiro = false,
}: TabelaAtendimentosProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-barber-light sm:text-xl">
          Atendimentos recentes
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          Últimos registros do período filtrado
        </p>
      </div>

      {loading ? (
        <div className="space-y-2" role="status" aria-label="Carregando atendimentos">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-barber-light/50">
          Nenhum atendimento no período.
        </p>
      ) : (
        <>
          {/* Mobile */}
          <ul className="space-y-2 sm:hidden">
            {data.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-white/5 bg-barber-black/60 px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-barber-light">
                      {a.servicoNome}
                    </p>
                    <p className="mt-0.5 text-xs text-barber-light/50">
                      {a.clienteNome}
                      {showBarbeiro ? ` · ${a.barbeiroNome}` : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-barber-light/40">
                      {formatDataCurta(a.data)} · {a.horario}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-barber-gold">
                      {formatCurrency(a.valor)}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[a.status]}`}
                    >
                      {labelStatus(a.status)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-barber-light/45">
                  <th className="pb-3 pr-3 font-medium">Data</th>
                  <th className="pb-3 pr-3 font-medium">Serviço</th>
                  <th className="pb-3 pr-3 font-medium">Cliente</th>
                  {showBarbeiro && (
                    <th className="pb-3 pr-3 font-medium">Barbeiro</th>
                  )}
                  <th className="pb-3 pr-3 font-medium text-right">Valor</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 pr-3 whitespace-nowrap text-barber-light/70">
                      <span className="tabular-nums">
                        {formatDataCurta(a.data)}
                      </span>
                      <span className="mx-1 text-barber-light/25">·</span>
                      <span className="tabular-nums text-barber-gold/80">
                        {a.horario}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-medium text-barber-light">
                      {a.servicoNome}
                    </td>
                    <td className="py-3 pr-3 text-barber-light/70">
                      {a.clienteNome}
                    </td>
                    {showBarbeiro && (
                      <td className="py-3 pr-3 text-barber-light/70">
                        {a.barbeiroNome}
                      </td>
                    )}
                    <td className="py-3 pr-3 text-right font-semibold tabular-nums text-barber-gold">
                      {formatCurrency(a.valor)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[a.status]}`}
                      >
                        {labelStatus(a.status)}
                      </span>
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

function formatDataCurta(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}
