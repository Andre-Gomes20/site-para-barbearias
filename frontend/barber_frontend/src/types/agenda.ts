/**
 * Tipos da Agenda do Barbeiro.
 */

export type AgendamentoStatus = 'concluido' | 'pendente' | 'cancelado' | 'confirmado'

export type FiltroDataId = 'hoje' | 'amanha' | 'semana' | 'calendario'

export interface Agendamento {
  id: string
  /** Ordem / número do agendamento no dia (ex: 1, 2, 3…) */
  ordem: number
  /** Horário de início HH:mm */
  horario: string
  /** Duração em minutos */
  duracaoMin: number
  servico: string
  cliente: string
  /** Valor em reais (número) */
  valor: number
  status: AgendamentoStatus
  /** Data ISO yyyy-mm-dd */
  data: string
  /** Observações opcionais */
  observacao?: string
}

export interface SlotLivre {
  id: string
  tipo: 'livre'
  /** Horário de início do intervalo livre */
  horarioInicio: string
  /** Horário de fim do intervalo livre */
  horarioFim: string
  /** Duração livre em minutos */
  duracaoMin: number
}

/** Item da timeline: agendamento ou intervalo livre */
export type TimelineItem =
  | { tipo: 'agendamento'; agendamento: Agendamento }
  | SlotLivre
