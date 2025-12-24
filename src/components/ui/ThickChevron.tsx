import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type ThickChevronTone = 'red' | 'green' | 'orange'
export type ThickChevronDirection = 'left' | 'right'

export interface ThickChevronProps extends HTMLAttributes<HTMLDivElement> {
  tone?: ThickChevronTone
  direction?: ThickChevronDirection
  chevrons?: number
  clipPath?: string
  children?: ReactNode
}

const fillClasses: Record<ThickChevronTone, string> = {
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-slate-900',
  orange: 'bg-orange-500 text-slate-900',
}

const leftClip = 'polygon(40% 0%, 100% 0%, 60% 50%, 100% 100%, 40% 100%, 0% 50%)'
const rightClip = 'polygon(0% 0%, 60% 0%, 100% 50%, 60% 100%, 0% 100%, 40% 50%)'
const layerOffset = 34

export function ThickChevron({
  tone = 'red',
  direction = 'right',
  chevrons = 1,
  clipPath,
  className = '',
  style,
  children,
  ...rest
}: ThickChevronProps) {
  const resolvedClip = clipPath ?? (direction === 'right' ? rightClip : leftClip)
  const fillClass = fillClasses[tone] ?? fillClasses.red
  const mergedStyle: CSSProperties = {
    ...style,
  }

  const chevronLayers = Math.max(1, Math.floor(chevrons))
  const directionFactor = direction === 'right' ? -1 : 1

  return (
    <div
      className={`relative inline-flex text-xs font-semibold uppercase tracking-[0.4em] ${className}`}
      style={mergedStyle}
      {...rest}
    >

      {Array.from({ length: chevronLayers }).map((_, index) => (
        <div
          key={`chevron-layer-${index}`}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${fillClass}`}
          style={{
            opacity: Math.max(0.25, 1 - index * 0.4),
            transform: `translateX(${directionFactor * index * layerOffset}px)`,
            clipPath: resolvedClip,
            WebkitClipPath: resolvedClip,
          }}
        />
      ))}

      <div
        className={`relative z-10 flex w-full items-center justify-center gap-3 px-6 py-4 ${fillClass}`}
        style={{ clipPath: resolvedClip, WebkitClipPath: resolvedClip }}
      >
        {children}
      </div>
    </div>
  )
}

export default ThickChevron
