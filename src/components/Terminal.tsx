import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { Badge } from './ui'

type FsNode = FsDir | FsFile

interface FsDir {
  type: 'dir'
  name: string
  children: Record<string, FsNode>
}

interface FsFile {
  type: 'file'
  name: string
  content: string
}

type HistoryEntry = {
  id: number
  cwd: string[]
  command: string
  output: string[]
  rendered: boolean
}

type CommandResult = {
  lines: string[]
  nextPwd?: string[]
  clear?: boolean
  didError?: boolean
}

const rawSources = import.meta.glob('../**/*', { as: 'raw', eager: true }) as Record<string, string>
const TYPING_INTERVAL_MS = 1

function buildVirtualFs(): FsDir {
  const root: FsDir = { type: 'dir', name: 'src', children: {} }

  Object.entries(rawSources).forEach(([path, content]) => {
    const normalized = path.replace(/^\.\.\//, '')
    if (!normalized) return
    const segments = normalized.split('/').filter(Boolean)
    insertFile(root, segments, content)
  })

  return root
}

function insertFile(root: FsDir, segments: string[], content: string) {
  let current: FsDir = root
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1
    if (isLast) {
      current.children[segment] = { type: 'file', name: segment, content }
      return
    }
    const next = current.children[segment]
    if (!next || next.type === 'file') {
      current.children[segment] = { type: 'dir', name: segment, children: {} }
    }
    current = current.children[segment] as FsDir
  })
}

const virtualRoot = buildVirtualFs()

function formatPath(cwd: string[]) {
  return `/${cwd.join('/')}`
}

function resolveSegments(pathInput: string | undefined, cwd: string[]): string[] {
  if (!pathInput || pathInput === '.') {
    return [...cwd]
  }

  const stack: string[] = pathInput.startsWith('/') || pathInput.startsWith('src') ? ['src'] : [...cwd]

  let tokens: string[]
  if (pathInput.startsWith('/')) {
    const trimmed = pathInput.replace(/^\/+/, '')
    tokens = trimmed.split('/').filter(Boolean)
    if (tokens[0] === 'src') {
      tokens = tokens.slice(1)
    }
  } else if (pathInput.startsWith('src/')) {
    tokens = pathInput.split('/').slice(1)
  } else if (pathInput === 'src') {
    tokens = []
  } else {
    tokens = pathInput.split('/').filter(Boolean)
  }

  tokens.forEach((token) => {
    if (token === '..') {
      if (stack.length > 1) stack.pop()
      return
    }
    if (token === '.' || !token) return
    stack.push(token)
  })

  return stack
}

function getNodeBySegments(root: FsDir, segments: string[]): FsNode | undefined {
  let current: FsNode = root
  for (let i = 1; i < segments.length; i += 1) {
    if (current.type !== 'dir') return undefined
    current = current.children[segments[i]]
    if (!current) return undefined
  }
  return current
}

function listDirectory(node: FsDir) {
  const entries = Object.values(node.children)
    .sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'dir' ? -1 : 1
    })
    .map((entry) => (entry.type === 'dir' ? `${entry.name}/` : entry.name))
  return entries.length ? entries : ['(empty)']
}

function executeCommand(command: string, cwd: string[], root: FsDir): CommandResult {
  const [rawCmd, ...args] = command.trim().split(/\s+/)
  const cmd = rawCmd.toLowerCase()

  if (!cmd) {
    return { lines: [] }
  }

  if (cmd === 'clear') {
    return { lines: [], clear: true }
  }

  if (cmd === 'help') {
    return {
      lines: ['Available commands:', '  ls [path]', '  cd <path>', '  pwd', '  cat <file>', '  grep <pattern> <file>', '  nano <file>', '  clear', '  help'],
    }
  }

  if (cmd === 'pwd') {
    return { lines: [formatPath(cwd)] }
  }

  if (cmd === 'ls') {
    const targetSegments = resolveSegments(args[0], cwd)
    const node = getNodeBySegments(root, targetSegments)
    if (!node) return { lines: [`ls: cannot access '${args[0] ?? ''}': No such file or directory`], didError: true }
    if (node.type === 'file') {
      return { lines: [node.name] }
    }
    return { lines: listDirectory(node) }
  }

  if (cmd === 'cd') {
    if (!args[0]) return { lines: ['cd: missing operand'], didError: true }
    const targetSegments = resolveSegments(args[0], cwd)
    const node = getNodeBySegments(root, targetSegments)
    if (!node || node.type !== 'dir') {
      return { lines: [`cd: no such directory: ${args[0]}`], didError: true }
    }
    return { lines: [], nextPwd: targetSegments }
  }

  if (cmd === 'cat') {
    if (!args[0]) return { lines: ['cat: missing file operand'], didError: true }
    const targetSegments = resolveSegments(args[0], cwd)
    const node = getNodeBySegments(root, targetSegments)
    if (!node || node.type !== 'file') {
      return { lines: [`cat: ${args[0]}: No such file`], didError: true }
    }
    return { lines: node.content.split('\n').slice(0, 120) }
  }

  if (cmd === 'grep') {
    const [patternArg, fileArg] = args
    if (!patternArg || !fileArg) {
      return { lines: ['usage: grep <pattern> <file>'], didError: true }
    }
    const targetSegments = resolveSegments(fileArg, cwd)
    const node = getNodeBySegments(root, targetSegments)
    if (!node || node.type !== 'file') {
      return { lines: [`grep: ${fileArg}: No such file`], didError: true }
    }
    const regex = new RegExp(patternArg, 'i')
    const matches = node.content.split('\n').filter((line) => regex.test(line))
    return { lines: matches.length ? matches : ['(no matches)'] }
  }

  if (cmd === 'nano') {
    return { lines: ['nano: editor disabled in read-only sandbox'], didError: true }
  }

  return { lines: [`${cmd}: command not found`], didError: true }
}

export interface TerminalProps {
  onCommandError?: (message: string) => void
}

export function Terminal({ onCommandError }: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState<string[]>(['src'])
  const [typedOutputs, setTypedOutputs] = useState<Record<number, string[]>>({})
  const typingTimers = useRef<Record<number, number>>({})
  const outputContainerRef = useRef<HTMLDivElement | null>(null)
  
    useEffect(() => {
      const container = outputContainerRef.current
      if (!container) return
      container.scrollTop = container.scrollHeight
    }, [history, typedOutputs])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!input.trim()) return

    const cwdSnapshot = [...cwd]
    const result = executeCommand(input, cwd, virtualRoot)
    if (result.didError && onCommandError) {
      onCommandError(result.lines.join('\n'))
    }
    if (result.clear) {
      setHistory([])
      setTypedOutputs({})
      Object.values(typingTimers.current).forEach((timerId) => window.clearInterval(timerId))
      typingTimers.current = {}
      setInput('')
      return
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        cwd: cwdSnapshot,
        command: input,
        output: result.lines,
        rendered: false,
      },
    ])
    if (result.nextPwd) {
      setCwd(result.nextPwd)
    }
    setInput('')
  }

  useEffect(() => {
    history.forEach((entry) => {
      if (entry.rendered || typingTimers.current[entry.id]) {
        return
      }

      let currentLine = 0
      let currentChar = 0
      const buffer: string[] = Array.from({ length: entry.output.length }, () => '')

      const intervalId = window.setInterval(() => {
        if (currentLine >= entry.output.length) {
          window.clearInterval(intervalId)
          delete typingTimers.current[entry.id]
          setHistory((prev) => prev.map((item) => (item.id === entry.id ? { ...item, rendered: true } : item)))
          return
        }

        const targetLine = entry.output[currentLine]
        buffer[currentLine] = targetLine.slice(0, currentChar + 1)
        setTypedOutputs((prev) => ({ ...prev, [entry.id]: [...buffer] }))

        currentChar += 1

        if (currentChar >= targetLine.length) {
          currentLine += 1
          currentChar = 0
        }
      }, TYPING_INTERVAL_MS)

      typingTimers.current[entry.id] = intervalId
    })

    return () => {
      Object.values(typingTimers.current).forEach((timerId) => window.clearInterval(timerId))
      typingTimers.current = {}
    }
  }, [history])

  return (
    <div className="w-full p-4 opacity-80">
      <div className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-700 rounded-sm p-2">

        <div className="w-full bg-black/80 p-3 text-gray-200 font-mono rounded-sm flex flex-row items-center gap-x-8">
          <div className="text-sm font-semibold uppercase tracking-wider" style={{ textShadow: `0 0 9px rgba(255,255,255,0.7)` }}>Terminal-04.alert</div>
          <div className="inline-block">
            <Badge tone="red" variant="soft" size="sm">exec.third.party</Badge>
          </div>
        </div>
        
        {/* Interactive terminal */}
        <div className="w-full bg-black/80 p-3 text-red-200 font-mono mt-1 text-sm rounded-sm font-semibold">
          <div ref={outputContainerRef} className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {history.map((entry) => (
              <div key={entry.id}>
                <div className="text-red-400">
                  <span>{formatPath(entry.cwd)}</span>
                  <span className="text-red-400"> $</span>
                  <span className="ml-2 text-red-200">{entry.command}</span>
                </div>
                {entry.output.map((line, index) => (
                  <p key={`${entry.id}-${index}`} className="text-red-200 whitespace-pre-wrap">
                    {typedOutputs[entry.id]?.[index] ?? (entry.rendered ? line : '')}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2 text-red-300 border-t border-gray-700 pt-3">
            <span>{formatPath(cwd)} $</span>
            <input
              className="flex-1 bg-transparent text-red-200 outline-none placeholder:text-gray-900/60"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a command (help for options)"
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default Terminal
