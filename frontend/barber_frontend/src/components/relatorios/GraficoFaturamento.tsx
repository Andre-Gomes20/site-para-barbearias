/**
 * Gráfico de área/linha — Faturamento por dia no período.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PontoFaturamento } from '../../types/relatorio'
import {
  formatCurrency,
  formatCurrencyCompact,
} from '../../data/mockRelatorios'

interface GraficoFaturamentoProps {
  data: PontoFaturamento[]
  loading?: boolean
}

export default function GraficoFaturamento({
  data,
  loading = false,
}: GraficoFaturamentoProps) {
  if (loading) {
    return <ChartSkeleton height="h-56 sm:h-72" label="Carregando faturamento…" />
  }

  if (data.length === 0) {
    return (
      <EmptyChart message="Sem faturamento no período selecionado." />
    )
  }

  const total = data.reduce((s, d) => s + d.valor, 0)

  return (
    <div className="rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-barber-light sm:text-xl">
          Faturamento no período
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          Total:{' '}
          <span className="font-semibold text-barber-gold">
            {formatCurrency(total)}
          </span>
        </p>
      </div>

      <div className="h-56 w-full sm:h-72 -ml-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="relatorioGoldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(245,245,245,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: 'rgba(245,245,245,0.45)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v: number) => formatCurrencyCompact(v)}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 12,
                color: '#f5f5f5',
              }}
              labelStyle={{ color: '#d4af37', fontWeight: 600 }}
              formatter={(value) => [
                formatCurrency(typeof value === 'number' ? value : Number(value)),
                'Faturamento',
              ]}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#d4af37"
              strokeWidth={2.5}
              fill="url(#relatorioGoldFill)"
              activeDot={{
                r: 5,
                fill: '#d4af37',
                stroke: '#1a1a1a',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ChartSkeleton({
  height,
  label,
}: {
  height: string
  label: string
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-6 ${height}`}
      role="status"
      aria-label={label}
    >
      <div className="mb-4 h-5 w-40 rounded bg-white/10" />
      <div className="mb-2 h-3 w-28 rounded bg-white/5" />
      <div className="mt-8 h-32 rounded-xl bg-white/5 sm:h-44" />
      <p className="mt-3 text-center text-xs text-barber-light/40">{label}</p>
    </div>
  )
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-barber-black-soft px-6 py-12 text-center">
      <p className="text-sm text-barber-light/50">{message}</p>
    </div>
  )
}
