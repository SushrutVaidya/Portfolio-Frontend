import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { parse, stats, type Level } from '@/lib/loglens'
import { DUR, EASE } from '@/lib/motion'

/**
 * Interactive loglens demo.
 *
 * Runs the ported loglens core (src/lib/loglens.ts) live in the browser: the
 * visitor edits raw log lines and toggles between the raw stream and the
 * --stats triage view, watching near-identical errors collapse into distinct
 * problems in real time. It is labelled as a browser port of the core, not the
 * compiled Java binary, because it is.
 */

const SAMPLE = `{"ts":"2026-08-15T10:22:03.010Z","level":"info","msg":"request completed","path":"/api/stats","status":200,"dur":"12ms"}
{"ts":"2026-08-15T10:22:03.114Z","level":"error","trace_id":"7b0e-c3","msg":"Connection to 10.0.3.14:5432 timed out after 30012ms"}
{"ts":"2026-08-15T10:22:03.221Z","level":"warn","msg":"cache miss","key":"user:8471"}
{"ts":"2026-08-15T10:22:03.330Z","level":"error","trace_id":"3e81-b7","msg":"Connection to 10.0.7.82:5432 timed out after 29984ms"}
{"ts":"2026-08-15T10:22:03.440Z","level":"info","msg":"request completed","path":"/api/steam/games","status":200,"dur":"8ms"}
{"ts":"2026-08-15T10:22:03.551Z","level":"error","trace_id":"a1c2-d3","msg":"Connection to 10.0.1.9:5432 timed out after 31002ms"}
level=warn msg="cache miss" key=user:2290
level=info msg="request completed" path=/api/rickroll status=200 dur=5ms
{"ts":"2026-08-15T10:22:03.880Z","level":"error","trace_id":"c4d5-e6","msg":"Connection to 10.0.4.51:5432 timed out after 30450ms"}`

const LEVEL_COLOUR: Record<Level, string> = {
  FATAL: 'var(--color-red)',
  ERROR: 'var(--color-red)',
  WARN: 'var(--color-yellow)',
  INFO: 'var(--color-blue)',
  DEBUG: 'var(--color-ink-muted)',
  TRACE: 'var(--color-ink-muted)',
  UNKNOWN: 'var(--color-ink-muted)',
}

type Mode = 'raw' | 'stats'

export function LoglensDemo() {
  const [input, setInput] = useState(SAMPLE)
  const [mode, setMode] = useState<Mode>('stats')
  const reduceMotion = useReducedMotion()

  const entries = useMemo(() => parse(input), [input])
  const summary = useMemo(() => stats(entries), [entries])

  return (
    <div className="card-pop overflow-hidden bg-paper-raised">
      {/* Toolbar: the command being run + mode toggles. */}
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-line-strong px-4 py-3">
        <div aria-hidden="true" className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full border border-line-strong bg-red" />
          <span className="h-3 w-3 rounded-full border border-line-strong bg-yellow" />
          <span className="h-3 w-3 rounded-full border border-line-strong bg-green" />
        </div>
        <code className="font-mono text-[0.8rem] text-ink">
          $ cat app.log | loglens{mode === 'stats' ? ' --stats' : ''}
        </code>
        <div className="ml-auto flex gap-2" role="group" aria-label="View mode">
          {(['raw', 'stats'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`font-mono rounded-full border-2 border-line-strong px-3 py-1 text-[0.7rem] font-semibold transition-colors ${
                mode === m ? 'bg-accent text-accent-ink' : 'bg-paper-raised text-ink hover:bg-paper'
              }`}
            >
              {m === 'raw' ? 'stream' : '--stats'}
            </button>
          ))}
        </div>
      </div>

      {/* Output: a dark terminal panel. */}
      <div
        className="min-h-[16rem] overflow-x-auto bg-paper-deep p-4 font-mono text-[0.8rem] leading-relaxed"
        style={{ color: '#e9e6dd' }}
        aria-live="polite"
      >
        {mode === 'raw' ? (
          <ul className="space-y-1">
            {entries.map((e, i) => (
              <motion.li
                key={i}
                initial={reduceMotion ? undefined : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DUR.fast, ease: EASE, delay: Math.min(i * 0.015, 0.3) }}
                className="flex gap-3 whitespace-pre"
              >
                <span style={{ color: '#807b70' }}>{e.time || '--:--:--'}</span>
                <span className="w-14 shrink-0 font-semibold" style={{ color: LEVEL_COLOUR[e.level] }}>
                  {e.level === 'UNKNOWN' ? '' : e.level}
                </span>
                <span className="min-w-0">{e.message}</span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="space-y-4">
            {/* Level counts. */}
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {(['ERROR', 'WARN', 'INFO'] as Level[]).map((l) =>
                summary.byLevel[l] ? (
                  <span key={l}>
                    <span style={{ color: LEVEL_COLOUR[l] }}>{l}</span>{' '}
                    <span style={{ color: '#e9e6dd' }}>{summary.byLevel[l]}</span>
                  </span>
                ) : null
              )}
            </div>
            <div style={{ color: '#807b70' }}>
              {entries.length} lines, {summary.groups.length} distinct{' '}
              {summary.groups.length === 1 ? 'problem' : 'problems'}
            </div>
            {/* The grouped findings, the whole point. */}
            <ul className="space-y-2">
              {summary.groups.map((g) => (
                <motion.li
                  key={g.template}
                  layout={!reduceMotion}
                  className="flex items-baseline gap-3 whitespace-pre-wrap"
                >
                  <span
                    className="shrink-0 font-semibold tabular-nums"
                    style={{ color: g.count > 1 ? LEVEL_COLOUR[g.level] : '#807b70' }}
                  >
                    {g.count}×
                  </span>
                  <span className="min-w-0" style={{ color: LEVEL_COLOUR[g.level] }}>
                    {g.template}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Editable input, so a visitor can paste their own logs. */}
      <details className="border-t-2 border-line-strong">
        <summary className="t-label cursor-pointer px-4 py-3 text-ink select-none">
          Paste your own log lines
        </summary>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          aria-label="Log input"
          className="font-mono block h-40 w-full resize-y border-t border-line bg-paper p-4 text-[0.75rem] text-ink outline-none"
        />
      </details>
    </div>
  )
}
