/**
 * Dados mockados e simulação de API para o fluxo de agendamento.
 * Substitua as funções por fetch/axios quando o backend estiver pronto.
 */

import type { Barbeiro, HorarioSlot, Servico } from '../types/agendamento'

// ─── Barbeiros ───────────────────────────────────────────────────────────────

export const BARBEIROS: Barbeiro[] = [
  {
    id: 'b1',
    nome: 'Rafael Mendes',
    especialidade: 'Corte clássico & degradê',
    fotoUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rafael&backgroundColor=1a1a1a',
    avaliacao: 4.9,
    experienciaAnos: 8,
  },
  {
    id: 'b2',
    nome: 'Lucas Costa',
    especialidade: 'Barba & bigode',
    fotoUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Lucas&backgroundColor=1a1a1a',
    avaliacao: 4.7,
    experienciaAnos: 5,
  },
  {
    id: 'b3',
    nome: 'Diego Almeida',
    especialidade: 'Fade & designs',
    fotoUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Diego&backgroundColor=1a1a1a',
    avaliacao: 4.8,
    experienciaAnos: 6,
  },
  {
    id: 'b4',
    nome: 'Bruno Ferreira',
    especialidade: 'Corte premium & coloração',
    fotoUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bruno&backgroundColor=1a1a1a',
    avaliacao: 4.6,
    experienciaAnos: 4,
  },
]

// ─── Serviços ────────────────────────────────────────────────────────────────

export const SERVICOS: Servico[] = [
  {
    id: 's1',
    nome: 'Corte Clássico',
    preco: 45,
    duracaoMinutos: 30,
    descricao: 'Corte tradicional com acabamento',
  },
  {
    id: 's2',
    nome: 'Corte + Barba',
    preco: 75,
    duracaoMinutos: 50,
    destaque: true,
    descricao: 'Combo completo — o mais pedido',
  },
  {
    id: 's3',
    nome: 'Barba Completa',
    preco: 40,
    duracaoMinutos: 25,
    descricao: 'Aparar, desenhar e hidratar',
  },
  {
    id: 's4',
    nome: 'Corte Degradê',
    preco: 50,
    duracaoMinutos: 40,
    descricao: 'Fade moderno com detalhe',
  },
  {
    id: 's5',
    nome: 'Sobrancelha',
    preco: 25,
    duracaoMinutos: 15,
    descricao: 'Design e limpeza',
  },
  {
    id: 's6',
    nome: 'Hidratação Capilar',
    preco: 35,
    duracaoMinutos: 20,
    descricao: 'Tratamento para cabelo saudável',
  },
]

// ─── Horários base (09:00 – 19:00, intervalo 30 min) ─────────────────────────

const HORARIOS_BASE = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
] as const

/**
 * Gera um conjunto determinístico de horários ocupados
 * a partir do id do barbeiro + data (para simular agenda real).
 */
function ocupadosPara(barbeiroId: string, dataIso: string): Set<string> {
  const seed = `${barbeiroId}-${dataIso}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }

  const ocupados = new Set<string>()
  // ~25–35% dos slots ocupados, de forma estável por dia/barbeiro
  HORARIOS_BASE.forEach((hora, index) => {
    if ((hash + index * 17) % 4 === 0 || (hash + index * 7) % 5 === 0) {
      ocupados.add(hora)
    }
  })
  return ocupados
}

/**
 * Simula GET /api/barbeiros/:id/horarios?data=YYYY-MM-DD
 * Atrasos artificiais para exercitar loading state na UI.
 */
export async function fetchHorariosDisponiveis(
  barbeiroId: string,
  dataIso: string,
): Promise<HorarioSlot[]> {
  // Simula latência de rede
  await new Promise((resolve) => setTimeout(resolve, 650))

  const ocupados = ocupadosPara(barbeiroId, dataIso)
  const hoje = new Date()
  const hojeIso = formatDateISO(hoje)
  const agoraMinutos = hoje.getHours() * 60 + hoje.getMinutes()

  return HORARIOS_BASE.map((hora) => {
    const [h, m] = hora.split(':').map(Number)
    const slotMinutos = h * 60 + m

    // Se for hoje, horários que já passaram ficam indisponíveis
    const passou = dataIso === hojeIso && slotMinutos <= agoraMinutos
    const ocupado = ocupados.has(hora)

    return {
      hora,
      disponivel: !ocupado && !passou,
    }
  })
}

/**
 * Simula POST /api/agendamentos
 */
export async function confirmarAgendamentoMock(
  payload: unknown,
): Promise<{ ok: true; id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 900))
  // Em produção: validar resposta da API
  console.info('[mock] Agendamento confirmado:', payload)
  return { ok: true, id: `ag-${Date.now()}` }
}

// ─── Helpers de formatação ───────────────────────────────────────────────────

/** Formata Date → "YYYY-MM-DD" (local, sem UTC shift) */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Formata "YYYY-MM-DD" → "14 jul 2026" (pt-BR curto) */
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Formata valor em reais: 75 → "R$ 75,00" */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Formata minutos: 75 → "1h 15min" / 30 → "30 min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const min = minutes % 60
  if (min === 0) return `${h}h`
  return `${h}h ${min}min`
}

/** Soma preços e durações dos serviços selecionados */
export function calcTotais(servicos: Servico[]): {
  valorTotal: number
  duracaoTotalMinutos: number
} {
  return servicos.reduce(
    (acc, s) => ({
      valorTotal: acc.valorTotal + s.preco,
      duracaoTotalMinutos: acc.duracaoTotalMinutos + s.duracaoMinutos,
    }),
    { valorTotal: 0, duracaoTotalMinutos: 0 },
  )
}
