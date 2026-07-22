/**
 * Gráfico de pizza — Serviços mais vendidos no período.
 */

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { ServicoRanking } from '../../types/relatorio'
import { formatCurrency } from '../../data/mockRelatorios'
import { ChartSkeleton, EmptyChart } from './GraficoFaturamento'

/** Paleta dourada / neutra alinhada ao tema */
const COLORS = [
  '#d4af37',
  '#e0c04a',
  '#a88b2a',
  '#f5f5f5',
  '#4d4d4d',
  '#c8102e',
  '#0f3d2b',
  '#8b7355',
]

interface GraficoServicosProps {
  data: ServicoRanking[]
  loading?: boolean
}

export default function GraficoServicos({
  data,
  loading = false,
}: GraficoServicosProps) {
  if (loading) {
    return <ChartSkeleton height="h-72" label="Carregando serviços…" />
  }

  if (data.length === 0) {
    return (
      <EmptyChart message="Nenhum serviço vendido no período selecionado." />
    )
  }

  const chartData = data.map((s) => ({
    name: s.nome,
    value: s.quantidade,
    valorTotal: s.valorTotal,
  }))

  return (
    <div className="rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-barber-light sm:text-xl">
          Serviços mais vendidos
        </h2>
        <p className="mt-0.5 text-sm text-barber-light/50">
          Por quantidade de atendimentos concluídos
        </p>
      </div>

      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="48%"
              outerRadius="72%"
              paddingAngle={2}
              stroke="rgba(0,0,0,0.3)"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 12,
                color: '#f5f5f5',
              }}
              formatter={(value, name, item) => {
                const qtd = typeof value === 'number' ? value : Number(value)
                const total =
                  (item?.payload as { valorTotal?: number } | undefined)
                    ?.valorTotal ?? 0
                return [
                  `${qtd}× · ${formatCurrency(total)}`,
                  String(name),
                ]
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-barber-light/70">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
