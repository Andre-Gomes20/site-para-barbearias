/**
 * Tipos do fluxo de agendamento (cliente).
 * Separados da autenticação para facilitar evolução e integração com API.
 */

/** Barbeiro disponível para agendamento */
export interface Barbeiro {
  id: string
  nome: string
  especialidade: string
  /** URL da foto (avatar). Se ausente, o UI exibe iniciais. */
  fotoUrl?: string
  /** Avaliação média (0–5), opcional para o card */
  avaliacao?: number
  /** Anos de experiência (exibição) */
  experienciaAnos?: number
}

/** Serviço oferecido pela barbearia */
export interface Servico {
  id: string
  nome: string
  /** Preço em reais (número, ex: 45.0) */
  preco: number
  /** Duração em minutos */
  duracaoMinutos: number
  /** Destaque visual (serviço popular) */
  destaque?: boolean
  descricao?: string
}

/** Slot de horário em um dia específico */
export interface HorarioSlot {
  /** Formato "HH:mm", ex: "09:00" */
  hora: string
  /** true = pode agendar; false = ocupado */
  disponivel: boolean
}

/** Payload final do agendamento (mock / futuro POST na API) */
export interface NovoAgendamentoPayload {
  barbeiroId: string
  servicoIds: string[]
  /** Data no formato ISO YYYY-MM-DD */
  data: string
  /** Hora no formato HH:mm */
  hora: string
  valorTotal: number
  duracaoTotalMinutos: number
}

/** Estado consolidado do formulário de agendamento */
export interface AgendamentoFormState {
  barbeiro: Barbeiro | null
  servicos: Servico[]
  data: string | null
  hora: string | null
}
