/**
 * Gráfico de barras — Performance por barbeiro (somente Admin).
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PerformanceBarbeiro } from '../../types/relatorio'
import {
  formatCurrency,
  formatCurrencyCompact,
} from '../../data/mockRelatorios'
import { ChartSkeleton, EmptyChart } from './GraficoFaturamento'

interface GraficoPerformanceBarbeirosProps {
  data: PerformanceBarbeiro[]
  loading?: boolean
}

export default function GraficoPerformanceBarbeiros({
  data,
  loading = false,
}: GraficoPerformanceBarbeirosProps) {
  if (loading) {
    return (
      <ChartSkeleton height="h-72" label="Carregando performance…" />
    )
  }

  if (data.length === 0) {
    return (
      <EmptyChart message="Sem dados de performance no período selecionado." />
    )
  }

  const chartData = data.map((p) => ({
    nome: firstName(p.nome),
    nomeCompleto: p.nome,
    faturamento: p.faturamento,
    atendimentos: p.atendimentos,
  }))

  return (
    <div className="rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-barber-light sm:text-xl">
          Performance por barbeiro
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          Faturamento de atendimentos concluídos
        </p>
      </div>

      <div className="h-64 w-full sm:h-72 -ml-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="nome"
              tick={{ fill: 'rgba(245,245,245,0.5)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
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
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as
                  | { nomeCompleto?: string }
                  | undefined
                return row?.nomeCompleto ?? ''
              }}
              formatter={(value) => [
                formatCurrency(typeof value === 'number' ? value : Number(value)),
                'Faturamento',
              ]}
            />
            <Bar
              dataKey="faturamento"
              fill="#d4af37"
              radius={[8, 8, 0, 0]}
              maxBarSize={56}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function firstName(full: string): string {
  return full.split(' ')[0] ?? full
}
