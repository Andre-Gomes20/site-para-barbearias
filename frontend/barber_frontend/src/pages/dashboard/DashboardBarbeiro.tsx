/**
 * Dashboard do Barbeiro
 * — Agenda do dia, métricas de performance, ações rápidas e próximos clientes.
 */

import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  DollarSign,
  ImagePlus,
  Percent,
  PlusCircle,
  Scissors,
  Users,
} from 'lucide-react'
import MetricCard from '../../components/dashboard/MetricCard'
import SectionTitle from '../../components/dashboard/SectionTitle'
import QuickActionButton from '../../components/dashboard/QuickActionButton'
import type { Appointment } from '../../components/dashboard/AppointmentCard'

interface DashboardBarbeiroProps {
  userName: string
}

/** Agenda simulada do dia */
const AGENDA_HOJE: (Appointment & { duration: string })[] = [
  {
    id: 'a1',
    service: 'Corte + Barba',
    client: 'Carlos Silva',
    date: 'Hoje',
    time: '09:00',
    duration: '50 min',
    price: 'R$ 75',
    status: 'concluido',
  },
  {
    id: 'a2',
    service: 'Corte Degradê',
    client: 'Pedro Alves',
    date: 'Hoje',
    time: '10:00',
    duration: '40 min',
    price: 'R$ 50',
    status: 'concluido',
  },
  {
    id: 'a3',
    service: 'Barba Completa',
    client: 'João Martins',
    date: 'Hoje',
    time: '11:00',
    duration: '25 min',
    price: 'R$ 40',
    status: 'confirmado',
  },
  {
    id: 'a4',
    service: 'Corte Clássico',
    client: 'André Souza',
    date: 'Hoje',
    time: '14:30',
    duration: '30 min',
    price: 'R$ 45',
    status: 'confirmado',
  },
  {
    id: 'a5',
    service: 'Corte + Barba',
    client: 'Felipe Rocha',
    date: 'Hoje',
    time: '16:00',
    duration: '50 min',
    price: 'R$ 75',
    status: 'pendente',
  },
]

const STATUS_DOT: Record<string, string> = {
  confirmado: 'bg-barber-gold',
  pendente: 'bg-barber-red',
  concluido: 'bg-emerald-400',
  cancelado: 'bg-barber-gray-mid',
}

export default function DashboardBarbeiro({ userName }: DashboardBarbeiroProps) {
  const navigate = useNavigate()
  const firstName = userName.split(' ')[0]
  const proximos = AGENDA_HOJE.filter(
    (a) => a.status === 'confirmado' || a.status === 'pendente',
  )
  const hojeFormatado = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <section id="inicio">
        <p className="text-sm text-barber-light/50 capitalize">{hojeFormatado}</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-barber-light">
          Agenda de {firstName}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-barber-light/55">
          Você tem <span className="text-barber-gold font-semibold">{proximos.length}</span>{' '}
          atendimentos restantes hoje.
        </p>
      </section>

      {/* Performance */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          title="Atendimentos hoje"
          value="5"
          subtitle="2 concluídos"
          icon={Scissors}
          accent="gold"
          trend="+1"
        />
        <MetricCard
          title="Faturamento do dia"
          value="R$ 285"
          subtitle="meta R$ 400"
          icon={DollarSign}
          accent="green"
          trend="71%"
        />
        <MetricCard
          title="Taxa de ocupação"
          value="78%"
          subtitle="da sua grade"
          icon={Percent}
          accent="red"
        />
      </section>

      {/* Ações rápidas */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <QuickActionButton
          label="Adicionar Serviço"
          icon={PlusCircle}
          variant="gold"
          onClick={() => navigate('/dashboard/servicos')}
        />
        <QuickActionButton
          label="Gerenciar Portfólio"
          icon={ImagePlus}
          variant="outline"
          onClick={() => navigate('/dashboard/portfolio')}
        />
      </section>

      {/* Agenda do dia (resumo) — ver página completa em /dashboard/agenda */}
      <section id="agenda">
        <SectionTitle
          title="Agenda do dia"
          subtitle="Horários em ordem cronológica"
          action={
            <Link
              to="/dashboard/agenda"
              className="inline-flex items-center gap-1.5 rounded-lg border border-barber-gold/30 bg-barber-gold/15 px-2.5 py-1.5 text-xs font-semibold text-barber-gold transition-colors hover:bg-barber-gold/25"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Ver agenda completa
            </Link>
          }
        />

        <ul className="space-y-2">
          {AGENDA_HOJE.map((item, index) => (
            <li key={item.id}>
              <article className="flex gap-3 rounded-2xl border border-white/5 bg-barber-black-soft p-3.5 sm:p-4">
                {/* Coluna horário */}
                <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-white/5 pr-3 sm:w-20">
                  <span className="text-base sm:text-lg font-bold text-barber-gold tabular-nums">
                    {item.time}
                  </span>
                  <span className="text-[11px] text-barber-light/40">{item.duration}</span>
                </div>

                {/* Conteúdo */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-barber-light">{item.service}</h3>
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[item.status]}`}
                      title={item.status}
                    />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-barber-light/55">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    {item.client}
                  </p>
                  {item.price && (
                    <p className="mt-1 text-sm font-medium text-barber-gold/90">
                      {item.price}
                    </p>
                  )}
                </div>

                {/* Indicador de ordem em mobile */}
                <span className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-barber-light/40">
                  {index + 1}
                </span>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* Próximos clientes */}
      <section id="clientes">
        <SectionTitle
          title="Próximos clientes"
          subtitle="Quem vem a seguir"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {proximos.map((c) => (
            <article
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-barber-black-soft p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-barber-gray text-barber-gold font-bold">
                {(c.client ?? '?')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-barber-light">{c.client}</p>
                <p className="truncate text-sm text-barber-light/50">{c.service}</p>
                <p className="text-sm font-medium text-barber-gold">{c.time}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
