/**
 * Dados mock realistas do portfólio do barbeiro.
 * Espelha a tabela `portfolio` do init.sql.
 * Substitua por fetch/axios quando a API estiver pronta.
 */

import type {
  PortfolioFormData,
  PortfolioFormErrors,
  PortfolioItem,
} from '../types/portfolio'

/** ID do barbeiro demo (AuthContext → Rafael Mendes, id "2") */
export const BARBEIRO_DEMO_ID = '2'

/** Limite de upload: 5 MB */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Formatos aceitos (MIME) */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

/** Extensões aceitas (para o atributo accept e mensagens) */
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

/**
 * Portfólio mock do barbeiro logado.
 * Imagens de Unsplash (trabalhos típicos de barbearia).
 */
export const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'port-1',
    urlImagem:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
    legenda: 'Degradê médio com acabamento na navalha',
    dataPostagem: '2026-07-18T14:30:00.000Z',
    barbeiroId: BARBEIRO_DEMO_ID,
    categoria: 'Corte',
  },
  {
    id: 'port-2',
    urlImagem:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    legenda: 'Barba desenhada + hidratação com toalha quente',
    dataPostagem: '2026-07-15T11:00:00.000Z',
    barbeiroId: BARBEIRO_DEMO_ID,
    categoria: 'Barba',
  },
  {
    id: 'port-3',
    urlImagem:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    legenda: 'Corte clássico social — cliente fidelizado',
    dataPostagem: '2026-07-10T16:45:00.000Z',
    barbeiroId: BARBEIRO_DEMO_ID,
    categoria: 'Corte',
  },
  {
    id: 'port-4',
    urlImagem:
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80',
    legenda: 'Fade alto com design lateral',
    dataPostagem: '2026-07-05T10:20:00.000Z',
    barbeiroId: BARBEIRO_DEMO_ID,
    categoria: 'Corte',
  },
  {
    id: 'port-5',
    urlImagem:
      'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&q=80',
    legenda: 'Combo corte + barba — resultado final',
    dataPostagem: '2026-06-28T13:10:00.000Z',
    barbeiroId: BARBEIRO_DEMO_ID,
    categoria: 'Combo',
  },
  {
    id: 'port-6',
    urlImagem:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    legenda: 'Ambiente e acabamento premium',
    dataPostagem: '2026-06-20T09:00:00.000Z',
    barbeiroId: BARBEIRO_DEMO_ID,
    categoria: 'Estilo',
  },
]

/** Formata data ISO para exibição em pt-BR */
export function formatDataPostagem(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Valores iniciais do formulário (adicionar foto) */
export function emptyPortfolioForm(): PortfolioFormData {
  return {
    arquivo: null,
    previewUrl: '',
    legenda: '',
  }
}

/**
 * Valida o arquivo de imagem (tipo + tamanho).
 * Retorna mensagem de erro em pt-BR ou null se válido.
 */
export function validateImageFile(file: File | null): string | null {
  if (!file) {
    return 'A imagem é obrigatória. Selecione uma foto do seu trabalho.'
  }

  const typeOk =
    ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    ) || /\.(jpe?g|png|webp)$/i.test(file.name)

  if (!typeOk) {
    return 'Formato inválido. Use apenas JPG, JPEG, PNG ou WEBP.'
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    return `A imagem tem ${mb} MB. O tamanho máximo permitido é 5 MB.`
  }

  return null
}

/**
 * Valida o formulário completo de portfólio.
 * Retorna objeto de erros (vazio = válido).
 */
export function validatePortfolioForm(
  data: PortfolioFormData,
): PortfolioFormErrors {
  const errors: PortfolioFormErrors = {}

  const imgError = validateImageFile(data.arquivo)
  if (imgError) {
    errors.imagem = imgError
  }

  if (data.legenda.trim().length > 200) {
    errors.legenda = 'A legenda deve ter no máximo 200 caracteres.'
  }

  return errors
}

/** Simula latência de API */
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
