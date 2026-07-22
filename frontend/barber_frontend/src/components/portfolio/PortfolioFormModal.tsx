/**
 * Modal de adicionar foto ao portfólio.
 * Upload com preview, legenda opcional e validações em pt-BR.
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import type {
  PortfolioFormData,
  PortfolioFormErrors,
} from '../../types/portfolio'
import {
  ACCEPTED_EXTENSIONS,
  emptyPortfolioForm,
  MAX_IMAGE_BYTES,
  validatePortfolioForm,
} from '../../data/mockPortfolio'

interface PortfolioFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PortfolioFormData) => Promise<void> | void
  /** Loading externo (salvar na API) */
  saving?: boolean
}

export default function PortfolioFormModal({
  open,
  onClose,
  onSubmit,
  saving = false,
}: PortfolioFormModalProps) {
  const titleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<PortfolioFormData>(emptyPortfolioForm)
  const [errors, setErrors] = useState<PortfolioFormErrors>({})
  const [touched, setTouched] = useState(false)

  // Preview local — revoga object URL ao trocar/fechar
  const previewRef = useRef<string>('')

  function revokePreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = ''
    }
  }

  // Reseta ao abrir
  useEffect(() => {
    if (!open) return
    revokePreview()
    setForm(emptyPortfolioForm())
    setErrors({})
    setTouched(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [open])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => revokePreview()
  }, [])

  // Fecha com Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, saving, onClose])

  // Trava scroll do body
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    revokePreview()

    if (!file) {
      const next: PortfolioFormData = {
        ...form,
        arquivo: null,
        previewUrl: '',
      }
      setForm(next)
      if (touched) setErrors(validatePortfolioForm(next))
      return
    }

    const objectUrl = URL.createObjectURL(file)
    previewRef.current = objectUrl
    const next: PortfolioFormData = {
      ...form,
      arquivo: file,
      previewUrl: objectUrl,
    }
    setForm(next)
    if (touched) setErrors(validatePortfolioForm(next))
    else {
      // Valida só a imagem imediatamente para feedback rápido no upload
      const imgErrors = validatePortfolioForm(next)
      if (imgErrors.imagem) {
        setErrors((prev) => ({ ...prev, imagem: imgErrors.imagem }))
      } else {
        setErrors((prev) => {
          const { imagem: _, ...rest } = prev
          return rest
        })
      }
    }
  }

  function clearImage() {
    revokePreview()
    if (fileInputRef.current) fileInputRef.current.value = ''
    const next: PortfolioFormData = {
      ...form,
      arquivo: null,
      previewUrl: '',
    }
    setForm(next)
    if (touched) setErrors(validatePortfolioForm(next))
  }

  function updateLegenda(value: string) {
    setForm((prev) => {
      const next = { ...prev, legenda: value }
      if (touched) setErrors(validatePortfolioForm(next))
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    const nextErrors = validatePortfolioForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit({
      ...form,
      legenda: form.legenda.trim(),
    })
  }

  const acceptAttr = ACCEPTED_EXTENSIONS.join(',')
  const maxMb = MAX_IMAGE_BYTES / (1024 * 1024)

  const fieldOk =
    'border-white/10 focus:border-barber-gold/50 focus:ring-barber-gold/40'
  const fieldErr =
    'border-barber-red/50 focus:border-barber-red focus:ring-barber-red/40'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Fechar modal"
        onClick={() => !saving && onClose()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92svh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-white/10 bg-barber-black-soft shadow-2xl sm:rounded-2xl"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-4 sm:px-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-barber-light">
              Adicionar Foto
            </h2>
            <p className="mt-0.5 text-sm text-barber-light/50">
              Mostre um dos seus melhores trabalhos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-barber-light/70 transition-colors hover:bg-white/5 hover:text-barber-light disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="dashboard-scroll flex-1 overflow-y-auto px-4 py-4 sm:px-5"
          noValidate
        >
          <div className="space-y-4">
            {/* Upload + preview */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-barber-light/80">
                Imagem <span className="text-barber-gold">*</span>
              </label>

              <input
                ref={fileInputRef}
                id="portfolio-imagem"
                type="file"
                accept={acceptAttr}
                onChange={handleFileChange}
                disabled={saving}
                className="sr-only"
                aria-invalid={!!errors.imagem}
                aria-describedby={
                  errors.imagem ? 'portfolio-imagem-err' : 'portfolio-imagem-hint'
                }
              />

              {form.previewUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-barber-black">
                  <img
                    src={form.previewUrl}
                    alt="Pré-visualização da foto"
                    className="mx-auto max-h-64 w-full object-contain"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                    <p className="min-w-0 truncate text-xs text-barber-light/80">
                      {form.arquivo?.name}
                      {form.arquivo
                        ? ` · ${(form.arquivo.size / (1024 * 1024)).toFixed(2)} MB`
                        : ''}
                    </p>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                        className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-barber-light transition-colors hover:bg-white/15 disabled:opacity-50"
                      >
                        Trocar
                      </button>
                      <button
                        type="button"
                        onClick={clearImage}
                        disabled={saving}
                        className="rounded-lg border border-barber-red/40 bg-barber-red/15 px-2.5 py-1.5 text-xs font-medium text-barber-red transition-colors hover:bg-barber-red/25 disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-10 transition-colors disabled:opacity-50 ${
                    errors.imagem
                      ? 'border-barber-red/50 bg-barber-red/5 hover:bg-barber-red/10'
                      : 'border-white/15 bg-barber-black hover:border-barber-gold/40 hover:bg-barber-gold/5'
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-barber-gold/10">
                    <Upload className="h-6 w-6 text-barber-gold" aria-hidden />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-barber-light">
                      Clique para enviar uma foto
                    </p>
                    <p
                      id="portfolio-imagem-hint"
                      className="mt-1 text-xs text-barber-light/45"
                    >
                      JPG, JPEG, PNG ou WEBP · máx. {maxMb} MB
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-barber-gold/15 px-3 py-1.5 text-xs font-semibold text-barber-gold">
                    <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                    Selecionar arquivo
                  </span>
                </button>
              )}

              {errors.imagem && (
                <p
                  id="portfolio-imagem-err"
                  className="mt-1.5 text-xs text-barber-red"
                  role="alert"
                >
                  {errors.imagem}
                </p>
              )}
            </div>

            {/* Legenda */}
            <div>
              <label
                htmlFor="portfolio-legenda"
                className="mb-1.5 block text-sm font-medium text-barber-light/80"
              >
                Legenda{' '}
                <span className="font-normal text-barber-light/40">
                  (opcional)
                </span>
              </label>
              <textarea
                id="portfolio-legenda"
                value={form.legenda}
                onChange={(e) => updateLegenda(e.target.value)}
                placeholder="Ex: Degradê médio com acabamento na navalha"
                rows={3}
                maxLength={200}
                disabled={saving}
                aria-invalid={!!errors.legenda}
                aria-describedby={
                  errors.legenda ? 'portfolio-legenda-err' : undefined
                }
                className={`w-full min-h-[88px] resize-y rounded-xl border bg-barber-black px-3.5 py-2.5 text-sm text-barber-light placeholder:text-barber-light/35 focus:outline-none focus:ring-1 transition-colors ${
                  errors.legenda ? fieldErr : fieldOk
                }`}
              />
              <div className="mt-1 flex items-center justify-between gap-2">
                {errors.legenda ? (
                  <p
                    id="portfolio-legenda-err"
                    className="text-xs text-barber-red"
                    role="alert"
                  >
                    {errors.legenda}
                  </p>
                ) : (
                  <span className="text-xs text-barber-light/35">
                    Descreva o corte ou estilo
                  </span>
                )}
                <span className="shrink-0 text-xs tabular-nums text-barber-light/35">
                  {form.legenda.length}/200
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-medium text-barber-light/80 transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-barber-gold px-5 text-sm font-bold text-barber-black transition-colors hover:bg-barber-gold-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-barber-black/30 border-t-barber-black" />
                  Salvando…
                </>
              ) : (
                'Salvar foto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
