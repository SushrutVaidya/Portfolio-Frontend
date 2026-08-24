/**
 * loglens, core logic, ported to TypeScript for the interactive demo.
 *
 * This is a faithful browser reimplementation of loglens's parsing, message
 * templating and --stats grouping, ported directly from the Java source
 * (dev.sushrut.loglens.{Level,MessageTemplate,LogParser}). It is NOT the
 * compiled Java binary running in the page, and the demo says so. The point is
 * that the behaviour a visitor sees, especially how --stats collapses
 * near-identical errors, is the tool's actual logic, not a mock.
 *
 * Scope: the demo handles JSON-lines and logfmt input plus a generic fallback,
 * which covers the sample logs. The real CLI also parses klog, Airflow, the
 * log4j family and Python logging; those matchers are omitted here because the
 * demo does not feed them, not because they are hard.
 */

export type Level = 'UNKNOWN' | 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

/** Ordering for level thresholds; UNKNOWN sorts lowest. */
export const LEVEL_ORDER: Level[] = ['UNKNOWN', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']

/** Port of Level.from: maps the many spellings real loggers emit onto the set. */
export function levelFrom(raw: unknown): Level {
  if (raw == null) return 'UNKNOWN'
  const s = String(raw).trim().toUpperCase()
  if (!s) return 'UNKNOWN'
  switch (s) {
    case 'TRACE': case 'TRC': case '5': return 'TRACE'
    case 'DEBUG': case 'DBG': case '4': return 'DEBUG'
    case 'INFO': case 'INFORMATION': case 'NOTICE': case '3': return 'INFO'
    case 'WARN': case 'WARNING': case 'WRN': case '2': return 'WARN'
    case 'ERROR': case 'ERR': case 'SEVERE': case '1': return 'ERROR'
    case 'FATAL': case 'CRITICAL': case 'CRIT': case 'PANIC': case '0': return 'FATAL'
    default: return 'UNKNOWN'
  }
}

/**
 * Port of MessageTemplate.RULES, in the SAME order. Order is load-bearing: the
 * most specific patterns run first, and numbers run last so every rule above
 * gets first refusal on its digits. The number rule has no trailing \b on
 * purpose, so "30012ms" templates and identical timeouts group.
 */
const RULES: { re: RegExp; to: string }[] = [
  { re: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, to: '<uuid>' },
  { re: /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/g, to: '<ts>' },
  { re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, to: '<ip>' },
  { re: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, to: '<email>' },
  { re: /\bhttps?:\/\/\S+/g, to: '<url>' },
  { re: /@[0-9a-fA-F]{4,}\b/g, to: '@<hash>' },
  { re: /-[0-9a-f]{8,10}-[0-9a-z]{5}\b/g, to: '-<pod>' },
  { re: /(?<=\s)\/(?:[\w.-]+\/)+[\w.-]+/g, to: '<path>' },
  { re: /\b[0-9a-fA-F]{16,}\b/g, to: '<hex>' },
  { re: /\b[0-9a-f]{4,}-[0-9a-z]{2,}\b/g, to: '<id>' },
  { re: /'[^']{0,80}'/g, to: "'<str>'" },
  { re: /"[^"]{0,80}"/g, to: '"<str>"' },
  { re: /\b(?:None|null|nil|NULL)\b/g, to: '<null>' },
  { re: /\b\d+(?:\.\d+)?/g, to: '<num>' },
]

/** Port of MessageTemplate.collapse. */
export function collapse(message: string): string {
  let out = message
  for (const { re, to } of RULES) out = out.replace(re, to)
  out = out.replace(/\s+/g, ' ').trim()
  return out.length > 160 ? out.slice(0, 160) : out
}

export interface Entry {
  level: Level
  /** HH:MM:SS extracted from a timestamp if present. */
  time: string
  message: string
  fields: Record<string, string>
  /** The raw line, kept for lines we cannot parse (passed through). */
  raw: string
}

const FIELD_ALIASES = {
  message: ['message', 'msg', '@message'],
  level: ['level', 'severity', 'lvl', 'loglevel'],
  time: ['timestamp', 'ts', 'time', '@timestamp'],
} as const

function shortTime(value: string | undefined): string {
  if (!value) return ''
  const m = value.match(/\d{2}:\d{2}:\d{2}/)
  return m ? m[0] : ''
}

function pick(obj: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const k of Object.keys(obj)) {
    if (keys.includes(k.toLowerCase())) return String(obj[k])
  }
  return undefined
}

/** Parse one line: JSON, then logfmt, then a generic fallback. */
export function parseLine(raw: string): Entry {
  const line = raw.trim()
  if (!line) return { level: 'UNKNOWN', time: '', message: '', fields: {}, raw }

  // JSON lines.
  if (line.startsWith('{')) {
    try {
      const obj = JSON.parse(line) as Record<string, unknown>
      const used = new Set<string>()
      const message = pick(obj, FIELD_ALIASES.message) ?? ''
      const level = levelFrom(pick(obj, FIELD_ALIASES.level))
      const time = shortTime(pick(obj, FIELD_ALIASES.time))
      for (const group of Object.values(FIELD_ALIASES))
        for (const k of Object.keys(obj))
          if (group.includes(k.toLowerCase() as never)) used.add(k)
      const fields: Record<string, string> = {}
      for (const [k, v] of Object.entries(obj))
        if (!used.has(k)) fields[k] = typeof v === 'object' ? JSON.stringify(v) : String(v)
      return { level, time, message, fields, raw }
    } catch {
      // fall through to logfmt/generic
    }
  }

  // logfmt: key=value pairs (values may be "quoted").
  if (/(^|\s)[\w.]+=/.test(line)) {
    const obj: Record<string, string> = {}
    const re = /([\w.@-]+)=(?:"([^"]*)"|(\S+))/g
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) obj[m[1]] = m[2] ?? m[3] ?? ''
    if (Object.keys(obj).length) {
      const used = new Set<string>()
      const message = pick(obj, FIELD_ALIASES.message) ?? ''
      const level = levelFrom(pick(obj, FIELD_ALIASES.level))
      const time = shortTime(pick(obj, FIELD_ALIASES.time))
      for (const group of Object.values(FIELD_ALIASES))
        for (const k of Object.keys(obj))
          if (group.includes(k.toLowerCase() as never)) used.add(k)
      const fields: Record<string, string> = {}
      for (const [k, v] of Object.entries(obj)) if (!used.has(k)) fields[k] = v
      return { level, time, message: message || line, fields, raw }
    }
  }

  // Generic: whole line is the message.
  return { level: 'UNKNOWN', time: '', message: line, fields: {}, raw }
}

export function parse(input: string): Entry[] {
  return input.split('\n').filter((l) => l.trim().length > 0).map(parseLine)
}

export interface StatsGroup {
  template: string
  count: number
  level: Level
}

/**
 * The --stats grouping: collapse each message to a template and count. This is
 * the "412 errors become 3 problems" move. Groups are returned sorted by count
 * descending, then by severity.
 */
export function stats(entries: Entry[]): { groups: StatsGroup[]; byLevel: Record<Level, number> } {
  const map = new Map<string, StatsGroup>()
  const byLevel = Object.fromEntries(LEVEL_ORDER.map((l) => [l, 0])) as Record<Level, number>
  for (const e of entries) {
    byLevel[e.level] += 1
    const template = collapse(e.message)
    const existing = map.get(template)
    if (existing) {
      existing.count += 1
      if (LEVEL_ORDER.indexOf(e.level) > LEVEL_ORDER.indexOf(existing.level)) existing.level = e.level
    } else {
      map.set(template, { template, count: 1, level: e.level })
    }
  }
  const groups = [...map.values()].sort(
    (a, b) => b.count - a.count || LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level)
  )
  return { groups, byLevel }
}
