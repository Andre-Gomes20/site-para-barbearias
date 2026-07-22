/**
 * Tipos do portfólio do barbeiro.
 * Alinhados à tabela `portfolio` (init.sql) e ao domínio do frontend.
 *
 * Banco:
 *   id, id_barbeiro, foto_url, descricao, categoria, created_at
 */

/** Item do portfólio (foto publicada pelo barbeiro) */
export interface PortfolioItem {
  id: string
  /** URL da imagem (foto_url no banco) */
  urlImagem: string
  /** Legenda opcional (descricao no banco) */
  legenda: string
  /** Data de postagem ISO (created_at no banco) */
  dataPostagem: string
  /** ID do barbeiro dono (id_barbeiro) */
  barbeiroId: string
  /** Categoria opcional (categoria no banco) */
  categoria?: string
}

/** Payload de criação (sem id / data — gerados no submit) */
export interface PortfolioFormData {
  /** Arquivo selecionado no upload (obrigatório na criação) */
  arquivo: File | null
  /** Preview local (object URL) ou vazio */
  previewUrl: string
  /** Legenda opcional */
  legenda: string
}

/** Erros de validação do formulário (mensagens em pt-BR) */
export type PortfolioFormErrors = Partial<
  Record<'imagem' | 'legenda', string>
>
