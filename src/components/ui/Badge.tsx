import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeTone = 'red' | 'slate' | 'amber' | 'fuchsia'
export type BadgeVariant = 'solid' | 'soft' | 'outline'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: ReactNode
}

// const palette: Record<BadgeTone, { solid: string; soft: string; outline: string }> = {
//   cyan: {
//     solid: 'bg-cyan-400/90 text-slate-950',
//     soft: 'bg-cyan-400/15 text-cyan-200 border border-cyan-400/20',
//     outline: 'border border-cyan-300/60 text-cyan-200',
//   },
//   slate: {
//     solid: 'bg-slate-100 text-slate-900',
//     soft: 'bg-white/10 text-slate-200 border border-white/10',
//     outline: 'border border-white/30 text-slate-200',
//   },
//   amber: {
//     solid: 'bg-amber-300 text-slate-950',
//     soft: 'bg-amber-300/20 text-amber-200 border border-amber-200/40',
//     outline: 'border border-amber-300/70 text-amber-100',
//   },
//   fuchsia: {
//     solid: 'bg-fuchsia-400 text-slate-950',
//     soft: 'bg-fuchsia-400/20 text-fuchsia-100 border border-fuchsia-300/40',
//     outline: 'border border-fuchsia-300/70 text-fuchsia-100',
//   },
// }

export function Badge({
  tone = 'red',
  variant = 'soft',
  size = 'sm',
  icon,
  className = '',
  children,
  ...rest
}: BadgeProps) {

  return (
    <div className="relative select-none" {...rest}>
      <div className="left-0 top-0 bottom-0 h-auto absolute border-l-2 border-red-500 w-3 bg-gradient-to-r from-gray-900 to-red-950">
        <div className="absolute top-1 bottom-1 -left-1 w-full bg-gradient-to-r from-gray-900 to-red-950 border-l-2 border-red-500"></div>
      </div>

      <div style={{ textShadow: `0 0 9px rgba(239,68,68,0.7)` }}
            className="h-full text-red-400 bg-red-950 py-1 px-6 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        {children}
      </div>

      <div className="right-0 top-0 bottom-0 h-auto absolute border-r-2 border-red-500 w-3 bg-gradient-to-l from-gray-900 to-red-950">
        <div className="absolute top-1 bottom-1 -right-1 w-full bg-gradient-to-l from-gray-900 to-red-950 border-r-2 border-red-500"></div>
      </div>
    </div>
  )
}

export default Badge
