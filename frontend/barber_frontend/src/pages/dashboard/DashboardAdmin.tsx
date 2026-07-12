/**
 * Dashboard do Administrador
 * — Métricas gerais, gráfico de faturamento, agenda do dia e atalhos de cadastro.
 */

import {
  Calendar,
  DollarSign,
  Scissors,
  UserPlus,
  Users,
  UsersRound,
  Briefcase,
  Settings,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import MetricCard from '../../components/dashboard/MetricCard'
import SectionTitle from '../../components/dashboard/SectionTitle'
import AppointmentCard, {
  type Appointment,
} from '../../components/dashboard/AppointmentCard'

/** Faturamento da semana (mock) — Recharts */
const FATURAMENTO_SEMANA = [
  { dia: 'Seg', valor: 820 },
  { dia: 'Ter', valor: 1100 },
  { dia: 'Qua', valor: 950 },
  { dia: 'Qui', valor: 1400 },
  { dia: 'Sex', valor: 1680 },
  { dia: 'Sáb', valor: 2100 },
  { dia: 'Dom', valor: 480 },
]

const AGENDAMENTOS_HOJE: Appointment[] = [
  {
    id: 'd1',
    service: 'Corte + Barba',
    client: 'Carlos Silva',
    barber: 'Rafael Mendes',
    date: 'Hoje',
    time: '09:00',
    price: 'R$ 75',
    status: 'concluido',
  },
  {
    id: 'd2',
    service: 'Corte Degradê',
    client: 'Pedro Alves',
    barber: 'Lucas Costa',
    date: 'Hoje',
    time: '10:00',
    price: 'R$ 50',
    status: 'confirmado',
  },
  {
    id: 'd3',
    service: 'Barba Completa',
    client: 'João Martins',
    barber: 'Rafael Mendes',
    date: 'Hoje',
    time: '11:00',
    price: 'R$ 40',
    status: 'confirmado',
  },
  {
    id: 'd4',
    service: 'Corte Clássico',
    client: 'André Souza',
    barber: 'Lucas Costa',
    date: 'Hoje',
    time: '14:30',
    price: 'R$ 45',
    status: 'pendente',
  },
]

const CADASTROS_RAPIDOS = [
  {
    id: 'barbeiro',
    label: 'Novo Barbeiro',
    description: 'Cadastrar profissional',
    icon: Scissors,
    href: '#barbeiros',
  },
  {
    id: 'cliente',
    label: 'Novo Cliente',
    description: 'Adicionar cliente',
    icon: UserPlus,
    href: '#clientes',
  },
  {
    id: 'servico',
    label: 'Novo Serviço',
    description: 'Catálogo de serviços',
    icon: Briefcase,
    href: '#cadastros',
  },
  {
    id: 'config',
    label: 'Configurações',
    description: 'Horários e unidade',
    icon: Settings,
    href: '#config',
  },
]

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

export default function DashboardAdmin() {
  const totalSemana = FATURAMENTO_SEMANA.reduce((acc, d) => acc + d.valor, 0)

  return (
    <div className="space-y-8">
      {/* Título */}
      <section id="inicio">
        <h1 className="text-2xl sm:text-3xl font-bold text-barber-light">
          Painel Administrativo
        </h1>
        <p className="mt-1 text-sm sm:text-base text-barber-light/55">
          Visão geral da barbearia em tempo real.
        </p>
      </section>

      {/* Métricas gerais */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          title="Faturamento total"
          value="R$ 48,2k"
          subtitle="este mês"
          icon={DollarSign}
          accent="gold"
          trend="+12%"
        />
        <MetricCard
          title="Clientes"
          value="1.284"
          subtitle="cadastrados"
          icon={Users}
          accent="default"
          trend="+38"
        />
        <MetricCard
          title="Barbeiros ativos"
          value="8"
          subtitle="na equipe"
          icon={UsersRound}
          accent="green"
        />
        <MetricCard
          title="Agendamentos hoje"
          value="24"
          subtitle="6 em andamento"
          icon={Calendar}
          accent="red"
        />
      </section>

      {/* Gráfico de faturamento */}
      <section id="relatorios" className="rounded-2xl border border-white/5 bg-barber-black-soft p-4 sm:p-6">
        <SectionTitle
          title="Faturamento da semana"
          subtitle={`Total: ${formatBRL(totalSemana)}`}
        />
        <div className="h-56 sm:h-72 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={FATURAMENTO_SEMANA}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="dia"
                tick={{ fill: 'rgba(245,245,245,0.5)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(245,245,245,0.45)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `${v / 1000}k`}
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
                  formatBRL(typeof value === 'number' ? value : Number(value)),
                  'Faturamento',
                ]}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#d4af37"
                strokeWidth={2.5}
                fill="url(#goldFill)"
                activeDot={{ r: 5, fill: '#d4af37', stroke: '#1a1a1a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Grid: agendamentos + cadastros */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Agendamentos do dia */}
        <section id="agendamentos" className="lg:col-span-3">
          <SectionTitle
            title="Agendamentos de hoje"
            subtitle="Todos os profissionais"
          />
          <div className="space-y-3">
            {AGENDAMENTOS_HOJE.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                personMode="client"
                compact
              />
            ))}
          </div>
        </section>

        {/* Acesso rápido cadastros */}
        <section id="cadastros" className="lg:col-span-2">
          <SectionTitle
            title="Acesso rápido"
            subtitle="Cadastros e gestão"
          />
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-1">
            {CADASTROS_RAPIDOS.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-white/5 bg-barber-black-soft p-4 transition-colors hover:border-barber-gold/30 hover:bg-barber-gold/5 active:scale-[0.99]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-barber-gold/15 text-barber-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-barber-light">{item.label}</p>
                    <p className="text-sm text-barber-light/50">{item.description}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
