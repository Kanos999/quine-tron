import type { ReactNode } from 'react'

export interface CardProps {
  title?: string
  subtitle?: string
  eyebrow?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
}

export function Card({ title, subtitle, eyebrow, action, children, className = '' }: CardProps) {
  return (
    <section className={`glass-panel rounded-3xl border border-white/5 p-6 ${className}`.trim()}>
      {(eyebrow || action) && (
        <div className="mb-4 flex items-start justify-between gap-4 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          <span>{eyebrow}</span>
          {action}
        </div>
      )}
      {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
      {subtitle && <p className="mt-2 text-sm text-slate-300">{subtitle}</p>}
      {children && <div className="mt-4 text-sm text-slate-200">{children}</div>}
    </section>
  )
}

export default Card
