/**
 * Modal de criar / editar serviço do barbeiro.
 * Validações em português; switch de status Ativo/Inativo.
 */

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Servico, ServicoFormData, ServicoFormErrors } from '../../types/servico'
import {
  emptyServicoForm,
  servicoToFormData,
  validateServicoForm,
} from '../../data/mockServicos'

interface ServicoFormModalProps {
  open: boolean
  /** null = modo criar; Servico = modo editar */
  servico: Servico | null
  onClose: () => void
  onSubmit: (data: ServicoFormData) => Promise<void> | void
  /** Loading externo (salvar na API) */
  saving?: boolean
}

export default function ServicoFormModal({
  open,
  servico,
  onClose,
  onSubmit,
  saving = false,
}: ServicoFormModalProps) {
  const titleId = useId()
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const isEdit = !!servico

  const [form, setForm] = useState<ServicoFormData>(emptyServicoForm)
  const [errors, setErrors] = useState<ServicoFormErrors>({})
  const [touched, setTouched] = useState(false)

  // Sincroniza formulário ao abrir / trocar serviço
  useEffect(() => {
    if (!open) return
    setForm(servico ? servicoToFormData(servico) : emptyServicoForm())
    setErrors({})
    setTouched(false)
    // Foco no primeiro campo após animação do modal
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, servico])

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

  function updateField<K extends keyof ServicoFormData>(
    key: K,
    value: ServicoFormData[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (touched) setErrors(validateServicoForm(next))
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    const nextErrors = validateServicoForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit({
      ...form,
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      duracaoMinutos: Number(form.duracaoMinutos),
      preco: Number(form.preco),
    })
  }

  const fieldClass =
    'h-11 w-full rounded-xl border bg-barber-black px-3.5 text-sm text-barber-light placeholder:text-barber-light/35 focus:outline-none focus:ring-1 transition-colors'
  const fieldOk = 'border-white/10 focus:border-barber-gold/50 focus:ring-barber-gold/40'
  const fieldErr = 'border-barber-red/50 focus:border-barber-red focus:ring-barber-red/40'

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
              {isEdit ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <p className="mt-0.5 text-sm text-barber-light/50">
              {isEdit
                ? 'Atualize as informações do serviço'
                : 'Preencha os dados do serviço que você oferece'}
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
            {/* Nome */}
            <div>
              <label
                htmlFor="servico-nome"
                className="mb-1.5 block text-sm font-medium text-barber-light/80"
              >
                Nome do serviço <span className="text-barber-gold">*</span>
              </label>
              <input
                ref={firstFieldRef}
                id="servico-nome"
                type="text"
                autoComplete="off"
                value={form.nome}
                onChange={(e) => updateField('nome', e.target.value)}
                placeholder="Ex: Corte Degradê"
                maxLength={100}
                disabled={saving}
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? 'servico-nome-err' : undefined}
                className={`${fieldClass} ${errors.nome ? fieldErr : fieldOk}`}
              />
              {errors.nome && (
                <p id="servico-nome-err" className="mt-1.5 text-xs text-barber-red" role="alert">
                  {errors.nome}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="servico-descricao"
                className="mb-1.5 block text-sm font-medium text-barber-light/80"
              >
                Descrição
              </label>
              <textarea
                id="servico-descricao"
                value={form.descricao}
                onChange={(e) => updateField('descricao', e.target.value)}
                placeholder="Breve descrição do que está incluso no serviço"
                rows={3}
                maxLength={500}
                disabled={saving}
                aria-invalid={!!errors.descricao}
                aria-describedby={
                  errors.descricao ? 'servico-descricao-err' : undefined
                }
                className={`w-full resize-y rounded-xl border bg-barber-black px-3.5 py-2.5 text-sm text-barber-light placeholder:text-barber-light/35 focus:outline-none focus:ring-1 transition-colors min-h-[88px] ${
                  errors.descricao ? fieldErr : fieldOk
                }`}
              />
              {errors.descricao && (
                <p
                  id="servico-descricao-err"
                  className="mt-1.5 text-xs text-barber-red"
                  role="alert"
                >
                  {errors.descricao}
                </p>
              )}
            </div>

            {/* Duração + Preço */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="servico-duracao"
                  className="mb-1.5 block text-sm font-medium text-barber-light/80"
                >
                  Duração (min) <span className="text-barber-gold">*</span>
                </label>
                <input
                  id="servico-duracao"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={480}
                  step={1}
                  value={form.duracaoMinutos || ''}
                  onChange={(e) =>
                    updateField(
                      'duracaoMinutos',
                      e.target.value === '' ? 0 : Number(e.target.value),
                    )
                  }
                  placeholder="30"
                  disabled={saving}
                  aria-invalid={!!errors.duracaoMinutos}
                  aria-describedby={
                    errors.duracaoMinutos ? 'servico-duracao-err' : undefined
                  }
                  className={`${fieldClass} tabular-nums ${
                    errors.duracaoMinutos ? fieldErr : fieldOk
                  }`}
                />
                {errors.duracaoMinutos && (
                  <p
                    id="servico-duracao-err"
                    className="mt-1.5 text-xs text-barber-red"
                    role="alert"
                  >
                    {errors.duracaoMinutos}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="servico-preco"
                  className="mb-1.5 block text-sm font-medium text-barber-light/80"
                >
                  Preço (R$) <span className="text-barber-gold">*</span>
                </label>
                <input
                  id="servico-preco"
                  type="number"
                  inputMode="decimal"
                  min={0.01}
                  max={10000}
                  step={0.01}
                  value={form.preco || ''}
                  onChange={(e) =>
                    updateField(
                      'preco',
                      e.target.value === '' ? 0 : Number(e.target.value),
                    )
                  }
                  placeholder="45,00"
                  disabled={saving}
                  aria-invalid={!!errors.preco}
                  aria-describedby={
                    errors.preco ? 'servico-preco-err' : undefined
                  }
                  className={`${fieldClass} tabular-nums ${
                    errors.preco ? fieldErr : fieldOk
                  }`}
                />
                {errors.preco && (
                  <p
                    id="servico-preco-err"
                    className="mt-1.5 text-xs text-barber-red"
                    role="alert"
                  >
                    {errors.preco}
                  </p>
                )}
              </div>
            </div>

            {/* Status switch */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-barber-black/60 px-3.5 py-3">
              <div>
                <p className="text-sm font-medium text-barber-light">Status</p>
                <p className="text-xs text-barber-light/50">
                  {form.ativo
                    ? 'Serviço visível para agendamento'
                    : 'Serviço oculto / indisponível'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.ativo}
                aria-label={form.ativo ? 'Desativar serviço' : 'Ativar serviço'}
                disabled={saving}
                onClick={() => updateField('ativo', !form.ativo)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-barber-gold/50 disabled:opacity-50 ${
                  form.ativo ? 'bg-barber-gold' : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-barber-light shadow transition-transform ${
                    form.ativo ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
              ) : isEdit ? (
                'Salvar alterações'
              ) : (
                'Criar serviço'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
