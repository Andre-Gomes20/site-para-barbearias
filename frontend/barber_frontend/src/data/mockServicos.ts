/**
 * Dados mock realistas dos serviços do barbeiro.
 * Substitua por fetch/axios quando a API estiver pronta.
 */

import type { Servico, ServicoFormData, ServicoFormErrors } from '../types/servico'

/** ID do barbeiro demo (AuthContext → Rafael Mendes, id "2") */
export const BARBEIRO_DEMO_ID = '2'

/**
 * Catálogo mock do barbeiro logado.
 * Espelha serviços típicos de barbearia (seed do init.sql + extras).
 */
export const MOCK_SERVICOS: Servico[] = [
  {
    id: 'svc-1',
    nome: 'Corte Clássico',
    descricao: 'Corte tradicional com máquina e tesoura, acabamento na navalha.',
    duracaoMinutos: 30,
    preco: 45,
    ativo: true,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
  {
    id: 'svc-2',
    nome: 'Corte + Barba',
    descricao: 'Combo completo: corte, barba desenhada e finalização.',
    duracaoMinutos: 50,
    preco: 75,
    ativo: true,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
  {
    id: 'svc-3',
    nome: 'Barba Completa',
    descricao: 'Aparar, desenhar contorno e hidratação com toalha quente.',
    duracaoMinutos: 25,
    preco: 40,
    ativo: true,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
  {
    id: 'svc-4',
    nome: 'Corte Degradê',
    descricao: 'Fade moderno com detalhe e acabamento preciso.',
    duracaoMinutos: 40,
    preco: 55,
    ativo: true,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
  {
    id: 'svc-5',
    nome: 'Sobrancelha',
    descricao: 'Design e limpeza de sobrancelha com navalha.',
    duracaoMinutos: 15,
    preco: 25,
    ativo: true,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
  {
    id: 'svc-6',
    nome: 'Pacote Premium',
    descricao: 'Corte, barba, sobrancelha e hidratação capilar.',
    duracaoMinutos: 75,
    preco: 120,
    ativo: true,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
  {
    id: 'svc-7',
    nome: 'Pigmentação de Barba',
    descricao: 'Preenchimento visual da barba com pigmento temporário.',
    duracaoMinutos: 35,
    preco: 60,
    ativo: false,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
  {
    id: 'svc-8',
    nome: 'Corte Infantil',
    descricao: 'Corte para crianças até 12 anos, com paciência e carinho.',
    duracaoMinutos: 25,
    preco: 35,
    ativo: false,
    barbeiroId: BARBEIRO_DEMO_ID,
  },
]

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

/** Valores iniciais do formulário (criar) */
export function emptyServicoForm(): ServicoFormData {
  return {
    nome: '',
    descricao: '',
    duracaoMinutos: 30,
    preco: 0,
    ativo: true,
  }
}

/** Converte entidade em dados de formulário (editar) */
export function servicoToFormData(servico: Servico): ServicoFormData {
  return {
    nome: servico.nome,
    descricao: servico.descricao,
    duracaoMinutos: servico.duracaoMinutos,
    preco: servico.preco,
    ativo: servico.ativo,
  }
}

/**
 * Valida o formulário de serviço.
 * Retorna objeto de erros (vazio = válido).
 */
export function validateServicoForm(data: ServicoFormData): ServicoFormErrors {
  const errors: ServicoFormErrors = {}

  const nome = data.nome.trim()
  if (!nome) {
    errors.nome = 'O nome do serviço é obrigatório.'
  } else if (nome.length < 2) {
    errors.nome = 'O nome deve ter pelo menos 2 caracteres.'
  } else if (nome.length > 100) {
    errors.nome = 'O nome deve ter no máximo 100 caracteres.'
  }

  if (data.descricao.trim().length > 500) {
    errors.descricao = 'A descrição deve ter no máximo 500 caracteres.'
  }

  const duracao = Number(data.duracaoMinutos)
  if (!Number.isFinite(duracao) || Number.isNaN(duracao)) {
    errors.duracaoMinutos = 'Informe a duração em minutos.'
  } else if (duracao <= 0) {
    errors.duracaoMinutos = 'A duração deve ser maior que 0.'
  } else if (!Number.isInteger(duracao)) {
    errors.duracaoMinutos = 'A duração deve ser um número inteiro de minutos.'
  } else if (duracao > 480) {
    errors.duracaoMinutos = 'A duração máxima é 480 minutos (8h).'
  }

  const preco = Number(data.preco)
  if (!Number.isFinite(preco) || Number.isNaN(preco)) {
    errors.preco = 'Informe o preço do serviço.'
  } else if (preco <= 0) {
    errors.preco = 'O preço deve ser maior que 0.'
  } else if (preco > 10_000) {
    errors.preco = 'O preço máximo é R$ 10.000,00.'
  }

  return errors
}

/** Simula latência de API */
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
