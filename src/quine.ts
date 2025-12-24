type TreeEntry = {
  name: string
  children?: Map<string, TreeEntry>
  isFile: boolean
}

const sourceGlobs = import.meta.glob('./**/*', { eager: false })

function insertPath(root: Map<string, TreeEntry>, relativePath: string) {
  const normalized = relativePath.replace(/^\.\//, '').split('/').filter(Boolean)
  if (!normalized.length) return

  let currentMap = root
  normalized.forEach((segment, index) => {
    if (!currentMap.has(segment)) {
      currentMap.set(segment, { name: segment, isFile: false })
    }
    const entry = currentMap.get(segment)!
    if (index === normalized.length - 1) {
      entry.isFile = true
      return
    }
    entry.children ??= new Map()
    currentMap = entry.children
  })
}

function mapToLines(tree: Map<string, TreeEntry>, prefix = ''): string[] {
  const entries = Array.from(tree.values()).sort((a, b) => {
    const aDir = Boolean(a.children)
    const bDir = Boolean(b.children)
    if (aDir !== bDir) {
      return aDir ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })

  const lines: string[] = []
  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1
    const connector = isLast ? '└──' : '├──'
    const suffix = entry.children ? '/' : ''
    lines.push(`${prefix}${connector} ${entry.name}${suffix}`)

    if (entry.children) {
      const childPrefix = `${prefix}${isLast ? '    ' : '│   '}`
      lines.push(...mapToLines(entry.children, childPrefix))
    }
  })

  return lines
}

export function listSourceTreeLines(): string[] {
  const root = new Map<string, TreeEntry>()
  Object.keys(sourceGlobs).forEach((path) => insertPath(root, path))
  return ['src/'].concat(mapToLines(root))
}
