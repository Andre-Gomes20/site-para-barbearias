/**
 * Tipos da página de Relatórios.
 * Alinhados às entidades: agendamento, pagamento, servico, usuario (barbeiro).
 */

/** Período pré-definido do filtro */
export type PeriodoId = 'hoje' | 'semana' | 'mes' | 'personalizado'

/** Intervalo de datas (yyyy-mm-dd) */
export interface DateRange {
  inicio: string
  fim: string
}

/** Barbeiro disponível no seletor (admin) */
export interface BarbeiroOption {
  id: string
  nome: string
}

/**
 * Linha bruta de atendimento (mock de agendamento + pagamento).
 * Espelha join entre agendamento, servico, usuario e pagamento.
 */
export interface AtendimentoRelatorio {
  id: string
  /** yyyy-mm-dd */
  data: string
  /** HH:mm */
  horario: string
  clienteNome: string
  barbeiroId: string
  barbeiroNome: string
  servicoId: string
  servicoNome: string
  /** Valor pago em reais */
  valor: number
  /** Duração em minutos */
  duracaoMin: number
  status: 'concluido' | 'confirmado' | 'pendente' | 'cancelado' | 'no_show'
  /** Método de pagamento (quando pago) */
  metodoPagamento?: 'PIX' | 'DINHEIRO' | 'CARTAO'
}

/** Métricas do card de resumo */
export interface MetricasRelatorio {
  faturamentoTotal: number
  quantidadeAtendimentos: number
  ticketMedio: number
  /** 0–100 */
  taxaOcupacao: number
}

/** Ponto do gráfico de faturamento */
export interface PontoFaturamento {
  /** Rótulo do eixo X (ex: "18/07" ou "Seg") */
  label: string
  /** Chave ordenável yyyy-mm-dd ou yyyy-Www */
  chave: string
  valor: number
  quantidade: number
}

/** Serviço agregado para gráfico/tabela */
export interface ServicoRanking {
  servicoId: string
  nome: string
  quantidade: number
  valorTotal: number
}

/** Performance por barbeiro (admin) */
export interface PerformanceBarbeiro {
  barbeiroId: string
  nome: string
  faturamento: number
  atendimentos: number
  ticketMedio: number
}

/** Resultado agregado completo do relatório */
export interface RelatorioAgregado {
  metricas: MetricasRelatorio
  faturamentoSerie: PontoFaturamento[]
  servicosRanking: ServicoRanking[]
  performanceBarbeiros: PerformanceBarbeiro[]
  atendimentosRecentes: AtendimentoRelatorio[]
}
