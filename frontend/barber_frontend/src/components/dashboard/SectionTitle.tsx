/**
 * Título de seção com ação opcional à direita.
 */

import type { ReactNode } from 'react'

interface SectionTitleProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-barber-light">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-barber-light/50">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
