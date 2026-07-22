/**
 * Dashboard do Cliente
 * — Boas-vindas, próximos agendamentos, CTA de agendar, serviços e histórico.
 */

import {
  CalendarPlus,
  ChevronRight,
  Clock,
  Sparkles,
  Star,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SectionTitle from '../../components/dashboard/SectionTitle'
import AppointmentCard, {
  type Appointment,
} from '../../components/dashboard/AppointmentCard'
import QuickActionButton from '../../components/dashboard/QuickActionButton'

interface DashboardClienteProps {
  userName: string
}

const PROXIMOS: Appointment[] = [
  {
    id: '1',
    service: 'Corte + Barba',
    barber: 'Rafael Mendes',
    date: '14 Jul 2026',
    time: '15:30',
    price: 'R$ 75',
    status: 'confirmado',
    location: 'Unidade Centro',
  },
  {
    id: '2',
    service: 'Corte Degradê',
    barber: 'Lucas Costa',
    date: '21 Jul 2026',
    time: '10:00',
    price: 'R$ 50',
    status: 'pendente',
    location: 'Unidade Centro',
  },
]

const SERVICOS = [
  {
    id: 's1',
    name: 'Corte Clássico',
    duration: '30 min',
    price: 'R$ 45',
    highlight: false,
  },
  {
    id: 's2',
    name: 'Corte + Barba',
    duration: '50 min',
    price: 'R$ 75',
    highlight: true,
  },
  {
    id: 's3',
    name: 'Barba Completa',
    duration: '25 min',
    price: 'R$ 40',
    highlight: false,
  },
  {
    id: 's4',
    name: 'Sobrancelha',
    duration: '15 min',
    price: 'R$ 25',
    highlight: false,
  },
]

const HISTORICO: Appointment[] = [
  {
    id: 'h1',
    service: 'Corte Degradê',
    barber: 'Rafael Mendes',
    date: '28 Jun 2026',
    time: '16:00',
    price: 'R$ 50',
    status: 'concluido',
  },
  {
    id: 'h2',
    service: 'Barba Completa',
    barber: 'Lucas Costa',
    date: '10 Jun 2026',
    time: '11:30',
    price: 'R$ 40',
    status: 'concluido',
  },
]

export default function DashboardCliente({ userName }: DashboardClienteProps) {
  const firstName = userName.split(' ')[0]
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Boas-vindas */}
      <section
        id="inicio"
        className="relative overflow-hidden rounded-2xl border border-barber-gold/20 bg-gradient-to-br from-barber-black-soft via-barber-gray to-barber-black p-5 sm:p-7"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-barber-gold/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-barber-red/10 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-barber-gold/15 px-3 py-1 text-xs font-semibold text-barber-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Área do cliente
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-barber-light">
            Olá, {firstName}! 👋
          </h1>
          <p className="mt-2 max-w-md text-sm sm:text-base text-barber-light/60">
            Pronto para o próximo visual? Agende seu horário ou confira seus
            compromissos abaixo.
          </p>
        </div>
      </section>

      {/* CTA principal — mobile first, botão grande */}
      <section>
        <QuickActionButton
          label="Agendar Novo Horário"
          icon={CalendarPlus}
          variant="gold"
          onClick={() => navigate('/agendamento')}
        />
      </section>

      {/* Próximos agendamentos */}
      <section id="agendamentos">
        <SectionTitle
          title="Próximos agendamentos"
          subtitle="Seus horários confirmados e pendentes"
          action={
            <a
              href="#agendamentos"
              className="inline-flex items-center gap-1 text-sm font-medium text-barber-gold hover:underline"
            >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </a>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {PROXIMOS.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} personMode="barber" />
          ))}
        </div>
        {PROXIMOS.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-barber-light/50">
            Nenhum agendamento futuro. Que tal marcar um horário?
          </p>
        )}
      </section>

      {/* Serviços em destaque */}
      <section id="servicos">
        <SectionTitle
          title="Serviços em destaque"
          subtitle="Escolha e agende em poucos toques"
        />
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICOS.map((svc) => (
            <article
              key={svc.id}
              className={`relative rounded-2xl border p-4 transition-colors ${
                svc.highlight
                  ? 'border-barber-gold/40 bg-barber-gold/10'
                  : 'border-white/5 bg-barber-black-soft hover:border-white/10'
              }`}
            >
              {svc.highlight && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-barber-gold px-2 py-0.5 text-[10px] font-bold uppercase text-barber-black">
                  <Star className="h-3 w-3" fill="currentColor" />
                  Popular
                </span>
              )}
              <h3 className="pr-16 font-semibold text-barber-light">{svc.name}</h3>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-barber-light/50">
                <Clock className="h-3.5 w-3.5" />
                {svc.duration}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-barber-gold">{svc.price}</span>
                <button
                  type="button"
                  onClick={() => navigate('/agendamento')}
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-barber-light hover:bg-barber-gold hover:text-barber-black transition-colors min-h-[40px]"
                >
                  Agendar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Histórico recente */}
      <section id="historico">
        <SectionTitle
          title="Histórico recente"
          subtitle="Últimos atendimentos"
        />
        <div className="space-y-3">
          {HISTORICO.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              personMode="barber"
              compact
            />
          ))}
        </div>
      </section>
    </div>
  )
}
