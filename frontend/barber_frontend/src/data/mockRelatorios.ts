/**
 * Dados mock realistas de relatórios.
 * Baseados em agendamento + pagamento + servico + barbeiro (init.sql).
 * Substitua por fetch/axios quando a API estiver pronta.
 */

import type {
  AtendimentoRelatorio,
  BarbeiroOption,
  DateRange,
  MetricasRelatorio,
  PerformanceBarbeiro,
  PeriodoId,
  PontoFaturamento,
  RelatorioAgregado,
  ServicoRanking,
} from '../types/relatorio'

/** IDs dos barbeiros demo (AuthContext: Rafael = "2") */
export const BARBEIROS_DEMO: BarbeiroOption[] = [
  { id: '2', nome: 'Rafael Mendes' },
  { id: '4', nome: 'Lucas Costa' },
  { id: '5', nome: 'Bruno Oliveira' },
  { id: '6', nome: 'Diego Santos' },
]

const SERVICOS = [
  { id: 'svc-1', nome: 'Corte Clássico', valor: 45, duracaoMin: 30 },
  { id: 'svc-2', nome: 'Corte + Barba', valor: 75, duracaoMin: 50 },
  { id: 'svc-3', nome: 'Barba Completa', valor: 40, duracaoMin: 25 },
  { id: 'svc-4', nome: 'Corte Degradê', valor: 55, duracaoMin: 40 },
  { id: 'svc-5', nome: 'Sobrancelha', valor: 25, duracaoMin: 15 },
  { id: 'svc-6', nome: 'Pacote Premium', valor: 120, duracaoMin: 75 },
] as const

const CLIENTES = [
  'Carlos Silva',
  'Pedro Alves',
  'João Martins',
  'André Souza',
  'Felipe Rocha',
  'Lucas Ferreira',
  'Marcos Lima',
  'Thiago Nunes',
  'Gabriel Costa',
  'Rafael Dias',
  'Bruno Vieira',
  'Eduardo Pinto',
]

const METODOS: Array<'PIX' | 'DINHEIRO' | 'CARTAO'> = [
  'PIX',
  'DINHEIRO',
  'CARTAO',
]

/** Retorna data local yyyy-mm-dd */
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

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** PRNG simples e determinístico (seed) para mock estável */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Gera ~90 dias de atendimentos mock (concluídos e alguns cancelados).
 * Seed fixo → mesmos dados a cada reload.
 */
function generateMockAtendimentos(): AtendimentoRelatorio[] {
  const rand = mulberry32(20260722)
  const items: AtendimentoRelatorio[] = []
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  let seq = 1

  for (let dayOffset = -60; dayOffset <= 0; dayOffset++) {
    const day = addDays(hoje, dayOffset)
    const iso = toISODate(day)
    const dow = day.getDay() // 0=dom

    // Domingos com menos movimento; sábados com mais
    let baseCount = dow === 0 ? 4 : dow === 6 ? 14 : 9
    baseCount = Math.max(2, Math.round(baseCount * (0.75 + rand() * 0.5)))

    const horarios = [
      '09:00',
      '09:40',
      '10:20',
      '11:00',
      '11:40',
      '13:00',
      '13:40',
      '14:20',
      '15:00',
      '15:40',
      '16:20',
      '17:00',
      '17:40',
      '18:20',
    ]

    for (let i = 0; i < baseCount; i++) {
      const barbeiro =
        BARBEIROS_DEMO[Math.floor(rand() * BARBEIROS_DEMO.length)]
      const servico = SERVICOS[Math.floor(rand() * SERVICOS.length)]
      const cliente = CLIENTES[Math.floor(rand() * CLIENTES.length)]
      const horario = horarios[i % horarios.length]

      // ~8% cancelados, ~4% no-show, resto concluído (histórico)
      const roll = rand()
      let status: AtendimentoRelatorio['status'] = 'concluido'
      if (roll < 0.08) status = 'cancelado'
      else if (roll < 0.12) status = 'no_show'

      // Atendimentos de hoje: mistura de status
      if (dayOffset === 0 && i >= baseCount - 3) {
        status = rand() > 0.5 ? 'confirmado' : 'pendente'
      }

      items.push({
        id: `rel-${seq++}`,
        data: iso,
        horario,
        clienteNome: cliente,
        barbeiroId: barbeiro.id,
        barbeiroNome: barbeiro.nome,
        servicoId: servico.id,
        servicoNome: servico.nome,
        valor: servico.valor,
        duracaoMin: servico.duracaoMin,
        status,
        metodoPagamento:
          status === 'concluido'
            ? METODOS[Math.floor(rand() * METODOS.length)]
            : undefined,
      })
    }
  }

  return items
}

export const MOCK_ATENDIMENTOS: AtendimentoRelatorio[] =
  generateMockAtendimentos()

/** Resolve o intervalo de datas a partir do período */
export function resolveDateRange(
  periodo: PeriodoId,
  custom?: DateRange | null,
): DateRange {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const fim = toISODate(hoje)

  if (periodo === 'hoje') {
    return { inicio: fim, fim }
  }

  if (periodo === 'semana') {
    const start = addDays(hoje, -6)
    return { inicio: toISODate(start), fim }
  }

  if (periodo === 'mes') {
    const start = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    return { inicio: toISODate(start), fim }
  }

  // personalizado
  if (custom?.inicio && custom?.fim) {
    if (custom.inicio > custom.fim) {
      return { inicio: custom.fim, fim: custom.inicio }
    }
    return custom
  }

  // fallback: últimos 7 dias
  return { inicio: toISODate(addDays(hoje, -6)), fim }
}

function isInRange(isoDate: string, range: DateRange): boolean {
  return isoDate >= range.inicio && isoDate <= range.fim
}

/** Conta dias inclusivos no intervalo */
function daysInRange(range: DateRange): number {
  const a = parseISODate(range.inicio).getTime()
  const b = parseISODate(range.fim).getTime()
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1)
}

/**
 * Filtra e agrega o relatório.
 * - barbeiroId null/"todos" = todos (admin)
 * - barbeiroId específico = só aquele profissional
 * - Conta faturamento apenas de status "concluido"
 * - Atendimentos = concluídos + confirmados (realizados/agendados no período)
 */
export function aggregateRelatorio(
  range: DateRange,
  barbeiroId: string | null,
  source: AtendimentoRelatorio[] = MOCK_ATENDIMENTOS,
): RelatorioAgregado {
  const filtrados = source.filter((a) => {
    if (!isInRange(a.data, range)) return false
    if (barbeiroId && barbeiroId !== 'todos' && a.barbeiroId !== barbeiroId) {
      return false
    }
    return true
  })

  const faturaveis = filtrados.filter((a) => a.status === 'concluido')
  const contaveis = filtrados.filter(
    (a) => a.status === 'concluido' || a.status === 'confirmado',
  )

  const faturamentoTotal = faturaveis.reduce((s, a) => s + a.valor, 0)
  const quantidadeAtendimentos = contaveis.length
  const ticketMedio =
    faturaveis.length > 0 ? faturamentoTotal / faturaveis.length : 0

  // Taxa de ocupação: minutos atendidos / capacidade teórica
  // Capacidade: 8h/dia × 60min × nº barbeiros no recorte × nº dias
  const barbeirosNoRecorte = new Set(
    (barbeiroId && barbeiroId !== 'todos'
      ? [barbeiroId]
      : BARBEIROS_DEMO.map((b) => b.id)
    ),
  )
  const capacidadeMin =
    daysInRange(range) * barbeirosNoRecorte.size * 8 * 60
  const minutosAtendidos = contaveis.reduce((s, a) => s + a.duracaoMin, 0)
  const taxaOcupacao =
    capacidadeMin > 0
      ? Math.min(100, Math.round((minutosAtendidos / capacidadeMin) * 1000) / 10)
      : 0

  const metricas: MetricasRelatorio = {
    faturamentoTotal,
    quantidadeAtendimentos,
    ticketMedio,
    taxaOcupacao,
  }

  // Série de faturamento por dia
  const porDia = new Map<string, { valor: number; quantidade: number }>()
  for (const a of faturaveis) {
    const cur = porDia.get(a.data) ?? { valor: 0, quantidade: 0 }
    cur.valor += a.valor
    cur.quantidade += 1
    porDia.set(a.data, cur)
  }

  // Preenche dias sem faturamento com 0
  const faturamentoSerie: PontoFaturamento[] = []
  let cursor = parseISODate(range.inicio)
  const end = parseISODate(range.fim)
  while (cursor.getTime() <= end.getTime()) {
    const chave = toISODate(cursor)
    const cur = porDia.get(chave) ?? { valor: 0, quantidade: 0 }
    faturamentoSerie.push({
      chave,
      label: formatLabelDia(chave, range),
      valor: cur.valor,
      quantidade: cur.quantidade,
    })
    cursor = addDays(cursor, 1)
  }

  // Ranking de serviços
  const porServico = new Map<string, ServicoRanking>()
  for (const a of faturaveis) {
    const cur = porServico.get(a.servicoId) ?? {
      servicoId: a.servicoId,
      nome: a.servicoNome,
      quantidade: 0,
      valorTotal: 0,
    }
    cur.quantidade += 1
    cur.valorTotal += a.valor
    porServico.set(a.servicoId, cur)
  }
  const servicosRanking = Array.from(porServico.values()).sort(
    (a, b) => b.quantidade - a.quantidade || b.valorTotal - a.valorTotal,
  )

  // Performance por barbeiro
  const porBarbeiro = new Map<string, PerformanceBarbeiro>()
  for (const a of faturaveis) {
    const cur = porBarbeiro.get(a.barbeiroId) ?? {
      barbeiroId: a.barbeiroId,
      nome: a.barbeiroNome,
      faturamento: 0,
      atendimentos: 0,
      ticketMedio: 0,
    }
    cur.faturamento += a.valor
    cur.atendimentos += 1
    porBarbeiro.set(a.barbeiroId, cur)
  }
  const performanceBarbeiros = Array.from(porBarbeiro.values())
    .map((p) => ({
      ...p,
      ticketMedio: p.atendimentos > 0 ? p.faturamento / p.atendimentos : 0,
    }))
    .sort((a, b) => b.faturamento - a.faturamento)

  // Atendimentos recentes (últimos 12, qualquer status no filtro)
  const atendimentosRecentes = [...filtrados]
    .sort((a, b) => {
      if (a.data !== b.data) return b.data.localeCompare(a.data)
      return b.horario.localeCompare(a.horario)
    })
    .slice(0, 12)

  return {
    metricas,
    faturamentoSerie,
    servicosRanking,
    performanceBarbeiros,
    atendimentosRecentes,
  }
}

function formatLabelDia(iso: string, range: DateRange): string {
  const d = parseISODate(iso)
  const span = daysInRange(range)
  if (span <= 14) {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** Formata valor em reais */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Formata valor compacto (eixo do gráfico) */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  }
  return `R$ ${Math.round(value)}`
}

/** Label amigável do período */
export function labelPeriodo(periodo: PeriodoId): string {
  switch (periodo) {
    case 'hoje':
      return 'Hoje'
    case 'semana':
      return 'Esta semana'
    case 'mes':
      return 'Este mês'
    case 'personalizado':
      return 'Personalizado'
  }
}

/** Label de status em pt-BR */
export function labelStatus(
  status: AtendimentoRelatorio['status'],
): string {
  const map: Record<AtendimentoRelatorio['status'], string> = {
    concluido: 'Concluído',
    confirmado: 'Confirmado',
    pendente: 'Pendente',
    cancelado: 'Cancelado',
    no_show: 'Não compareceu',
  }
  return map[status]
}

/** Simula latência de API */
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
