/**
 * Tipos da gestão de serviços do barbeiro.
 * Alinhados à entidade de domínio e ao mock (barbeiro gerencia os próprios serviços).
 */

/** Serviço oferecido por um barbeiro */
export interface Servico {
  id: string
  nome: string
  descricao: string
  /** Duração em minutos (deve ser > 0) */
  duracaoMinutos: number
  /** Preço em reais (deve ser > 0) */
  preco: number
  /** Se o serviço está disponível para agendamento */
  ativo: boolean
  /** ID do barbeiro dono do serviço */
  barbeiroId: string
}

/** Payload de criação / edição (sem id) */
export type ServicoFormData = Omit<Servico, 'id' | 'barbeiroId'>

/** Erros de validação do formulário (mensagens em pt-BR) */
export type ServicoFormErrors = Partial<
  Record<'nome' | 'descricao' | 'duracaoMinutos' | 'preco', string>
>
