import type { ReactNode, ComponentProps } from 'react'
import ThickChevron from './ThickChevron'

export interface HeaderProps {
  eyebrow?: string
  title: string
  description?: string
  kicker?: string
  actions?: ReactNode
  alignment?: 'left' | 'center'
  variant?: 'success' | 'warning' | 'error'
  className?: string
}

export function Header({
  title,
  variant = 'error',
}: HeaderProps) {
  type ChevronTone = ComponentProps<typeof ThickChevron>['tone']

  const palettes: Record<NonNullable<HeaderProps['variant']>, { accent: string; border: string; glow: string; text: string; chevronTone: ChevronTone }> = {
    success: {
      accent: '#14532d',
      border: 'border-green-500',
      glow: 'rgba(34,197,94,0.7)',
      text: 'text-green-500',
      chevronTone: 'green' as ChevronTone,
    },
    warning: {
      accent: '#7c2d12',
      border: 'border-orange-500',
      glow: 'rgba(249,115,22,0.7)',
      text: 'text-orange-500',
      chevronTone: 'orange' as ChevronTone,
    },
    error: {
      accent: '#7f1d1d',
      border: 'border-red-500',
      glow: 'rgba(239,68,68,0.7)',
      text: 'text-red-500',
      chevronTone: 'red' as ChevronTone,
    },
  }
  const palette = palettes[variant]

  const borderClass = palette.border
  const textAccent = palette.text
  const chevronTone = palette.chevronTone

  return (
    <div className="w-full p-4 opacity-80 select-none">
      <div
        className={`p-4 border-2 ${borderClass} text-4xl font-black text-center text-white uppercase relative`}
        style={{ background: `linear-gradient(90deg, ${palette.accent}, #000000, ${palette.accent})` }}
      >
        
        <div
          className={`absolute -left-1 top-4 bottom-4 border-l-2 ${borderClass} w-1`}
          style={{ backgroundColor: palette.accent }}
        ></div>
        <div
          className={`absolute -right-1 top-4 bottom-4 border-r-2 ${borderClass} w-1`}
          style={{ backgroundColor: palette.accent }}
        ></div>

        <div className="absolute left-0 top-0 bottom-0 p-1">
          <ThickChevron chevrons={2} direction="left" tone={chevronTone} className="opacity-60 !h-full" />
        </div>
        
        <div style={{ textShadow: `0 0 9px ${palette.glow}` }} className="z-30">
          {title}
        </div>

        <div className="absolute right-0 top-0 bottom-0 p-1">
          <ThickChevron chevrons={2} direction="right" tone={chevronTone} className="opacity-60 !h-full" />
        </div>
        {/* Decorations */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 bg-gradient-to-b from-black from-50% to-transparent ${textAccent} text-xs font-bold`}>
          {new Date().toLocaleTimeString()}
        </div>

        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 ${textAccent} text-xs font-bold space-x-60`}>
          <div className="inline-block px-2 bg-gradient-to-t from-black from-50% to-transparent">-</div>
          <div className="inline-block px-2 bg-gradient-to-t from-black from-50% to-transparent">-</div>
        </div>
      </div>
    </div>
  )
}

export default Header
