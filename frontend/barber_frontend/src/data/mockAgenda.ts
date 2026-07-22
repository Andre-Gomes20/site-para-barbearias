/**
 * Dados mock realistas da Agenda do Barbeiro.
 */

import type { Agendamento } from '../types/agenda'

/** Retorna data local no formato yyyy-mm-dd */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

const HOJE = toISODate(new Date())
const AMANHA = toISODate(addDays(new Date(), 1))
const DEPOIS_AMANHA = toISODate(addDays(new Date(), 2))
const EM_3_DIAS = toISODate(addDays(new Date(), 3))

/**
 * Agenda mock com status variados (concluído, pendente, cancelado, confirmado).
 * Datas relativas a "hoje" para os filtros funcionarem.
 */
export const MOCK_AGENDAMENTOS: Agendamento[] = [
  // —— Hoje ——
  {
    id: 'ag-01',
    ordem: 1,
    horario: '09:00',
    duracaoMin: 50,
    servico: 'Corte + Barba',
    cliente: 'Carlos Silva',
    valor: 75,
    status: 'concluido',
    data: HOJE,
  },
  {
    id: 'ag-02',
    ordem: 2,
    horario: '10:00',
    duracaoMin: 40,
    servico: 'Corte Degradê',
    cliente: 'Pedro Alves',
    valor: 50,
    status: 'concluido',
    data: HOJE,
  },
  {
    id: 'ag-03',
    ordem: 3,
    horario: '11:00',
    duracaoMin: 25,
    servico: 'Barba Completa',
    cliente: 'João Martins',
    valor: 40,
    status: 'pendente',
    data: HOJE,
  },
  {
    id: 'ag-04',
    ordem: 4,
    horario: '12:00',
    duracaoMin: 30,
    servico: 'Corte Clássico',
    cliente: 'Lucas Ferreira',
    valor: 45,
    status: 'cancelado',
    data: HOJE,
    observacao: 'Cliente cancelou por telefone',
  },
  {
    id: 'ag-05',
    ordem: 5,
    horario: '14:30',
    duracaoMin: 50,
    servico: 'Corte + Barba',
    cliente: 'André Souza',
    valor: 75,
    status: 'confirmado',
    data: HOJE,
  },
  {
    id: 'ag-06',
    ordem: 6,
    horario: '16:00',
    duracaoMin: 40,
    servico: 'Corte Navalhado',
    cliente: 'Felipe Rocha',
    valor: 55,
    status: 'pendente',
    data: HOJE,
  },
  {
    id: 'ag-07',
    ordem: 7,
    horario: '17:00',
    duracaoMin: 30,
    servico: 'Acabamento + Sobrancelha',
    cliente: 'Bruno Costa',
    valor: 35,
    status: 'confirmado',
    data: HOJE,
  },

  // —— Amanhã ——
  {
    id: 'ag-08',
    ordem: 1,
    horario: '09:30',
    duracaoMin: 50,
    servico: 'Corte + Barba',
    cliente: 'Marcos Oliveira',
    valor: 75,
    status: 'confirmado',
    data: AMANHA,
  },
  {
    id: 'ag-09',
    ordem: 2,
    horario: '11:00',
    duracaoMin: 40,
    servico: 'Corte Degradê',
    cliente: 'Thiago Nunes',
    valor: 50,
    status: 'pendente',
    data: AMANHA,
  },
  {
    id: 'ag-10',
    ordem: 3,
    horario: '15:00',
    duracaoMin: 60,
    servico: 'Pacote Premium',
    cliente: 'Ricardo Mendes',
    valor: 120,
    status: 'confirmado',
    data: AMANHA,
  },

  // —— Esta semana ——
  {
    id: 'ag-11',
    ordem: 1,
    horario: '10:00',
    duracaoMin: 40,
    servico: 'Corte Clássico',
    cliente: 'Diego Santos',
    valor: 45,
    status: 'pendente',
    data: DEPOIS_AMANHA,
  },
  {
    id: 'ag-12',
    ordem: 2,
    horario: '14:00',
    duracaoMin: 50,
    servico: 'Corte + Barba',
    cliente: 'Gustavo Lima',
    valor: 75,
    status: 'confirmado',
    data: EM_3_DIAS,
  },
]

/** Formata valor em Real brasileiro */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Formata duração em texto legível */
export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}
