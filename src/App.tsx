import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { Header } from './components/ui'
import Terminal from './components/Terminal'
import Background from 'ascii-ocean'

const statusPalette = {
  default: {
    // backgroundTextClass: '!text-gray-900/80',
    // textColor: '#1f2937',
    backgroundTextClass: '!text-white/10',
    textColor: '#7f1d1d',
    headerVariant: 'error' as const,
  },
  warning: {
    backgroundTextClass: '!text-orange-950/70',
    textColor: '#9a3412',
    headerVariant: 'warning' as const,
  },
  success: {
    backgroundTextClass: '!text-green-950/70',
    textColor: '#166534',
    headerVariant: 'success' as const,
  },
  error: {
    backgroundTextClass: '!text-red-950/70',
    textColor: '#7f1d1d',
    headerVariant: 'error' as const,
  },
}

type StatusKey = keyof typeof statusPalette
type HeaderVariant = (typeof statusPalette)[StatusKey]['headerVariant']
const HEADER_EXIT_DURATION = 420 + 450

function App() {
  const [status, setStatus] = useState<StatusKey>('default')
  const [popupText, setPopupText] = useState("")
  const [headerVisible, setHeaderVisible] = useState(false)
  const [headerPhase, setHeaderPhase] = useState<'enter' | 'exit'>('enter')
  const [activeHeaderVariant, setActiveHeaderVariant] = useState<HeaderVariant>(statusPalette.error.headerVariant)
  const [backgroundPhase, setBackgroundPhase] = useState<'idle' | 'alert' | 'reverse'>('idle')
  const [backgroundFromColor, setBackgroundFromColor] = useState(statusPalette.default.textColor)
  const headerExitTimer = useRef<number | null>(null)
  const backgroundPhaseTimer = useRef<number | null>(null)
  const previousStatusRef = useRef<StatusKey>('default')
  const palette = statusPalette[status]

  useEffect(() => {
    if (status !== 'error') return
    const timer = window.setTimeout(() => setStatus('default'), 5000)
    return () => window.clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (status !== 'default') {
      if (headerExitTimer.current) {
        window.clearTimeout(headerExitTimer.current)
        headerExitTimer.current = null
      }
      setHeaderVisible(true)
      setHeaderPhase('enter')
      setActiveHeaderVariant(statusPalette[status].headerVariant)
      return
    }

    if (headerVisible) {
      setHeaderPhase('exit')
      headerExitTimer.current = window.setTimeout(() => {
        setHeaderVisible(false)
        headerExitTimer.current = null
      }, HEADER_EXIT_DURATION)
    }

    return () => {
      if (headerExitTimer.current) {
        window.clearTimeout(headerExitTimer.current)
        headerExitTimer.current = null
      }
    }
  }, [status, headerVisible])

  useEffect(() => () => {
    if (headerExitTimer.current) {
      window.clearTimeout(headerExitTimer.current)
      headerExitTimer.current = null
    }
  }, [])

  useEffect(() => () => {
    if (backgroundPhaseTimer.current) {
      window.clearTimeout(backgroundPhaseTimer.current)
      backgroundPhaseTimer.current = null
    }
  }, [])

  useEffect(() => {
    const previousStatus = previousStatusRef.current
    setBackgroundFromColor(statusPalette[previousStatus].textColor)

    if (status === 'error' && previousStatus !== 'error') {
      setBackgroundPhase('alert')
    } else if (previousStatus === 'error' && status === 'default') {
      setBackgroundPhase('reverse')
    } else {
      setBackgroundPhase('idle')
    }

    previousStatusRef.current = status
  }, [status])

  useEffect(() => {
    if (backgroundPhase === 'idle') {
      return
    }

    if (backgroundPhaseTimer.current) {
      window.clearTimeout(backgroundPhaseTimer.current)
    }

    backgroundPhaseTimer.current = window.setTimeout(() => {
      setBackgroundPhase('idle')
      backgroundPhaseTimer.current = null
    }, 700)

    return () => {
      if (backgroundPhaseTimer.current) {
        window.clearTimeout(backgroundPhaseTimer.current)
        backgroundPhaseTimer.current = null
      }
    }
  }, [backgroundPhase])

  const handleTerminalError = (message: string) => {
    setPopupText(message)
    setStatus('error')
  }

  // setStatus(value) to change colours based on status

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 p-4 text-slate-100">
      <div className="absolute inset-0 -z-10 overflow-hidden w-full !h-full">
        <Background
          data-bg-phase={backgroundPhase}
          className={`background-text-surface !bg-black ${palette.backgroundTextClass}`}
          style={{
            color: palette.textColor,
            transition: 'color 500ms cubic-bezier(0.33, 1, 0.68, 1)',
            '--bg-from-color': backgroundFromColor,
            '--bg-to-color': palette.textColor,
          } as CSSProperties}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      />
      {headerVisible && (
        <div className="header-reveal-shell" data-phase={headerPhase}>
          <div className="header-reveal-inner w-full" data-phase={headerPhase}>
            <Header
              eyebrow="Tailwind kinetic surface"
              title={popupText}
              variant={activeHeaderVariant}
              description="Quine Tron layers React, Vite, and Tailwind into a single creative console so you can choreograph motion, typography, and layout in one expressive pass."
            />
          </div>
        </div>
      )}

      <Terminal onCommandError={handleTerminalError} />
    </div>
  )
}

export default App
