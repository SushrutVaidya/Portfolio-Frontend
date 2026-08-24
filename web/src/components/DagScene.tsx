import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * DagScene: an animated Airflow-style task graph, the hero's centrepiece.
 *
 * Sushrut orchestrates thousands of Airflow DAGs, so the "beautiful thing to
 * look at" is his actual job, drawn as Airflow's graph view. Tasks light up in
 * dependency order on a loop (queued -> running -> success), edges are curved
 * beziers that flow as each upstream completes, running nodes glow, and the
 * canvas has a faint dotted grid like the real Airflow UI. No 3D assets, no
 * illustration, no AI art: SVG plus a small state machine.
 *
 * Honest: the header says "illustrative" and the only number is the live task
 * count from the animation. Under reduced motion it renders the finished graph.
 */

type NodeDef = { id: string; label: string; cx: number; cy: number; depth: number }

const NODES: NodeDef[] = [
  { id: 'ingest', label: 'ingest', cx: 84, cy: 160, depth: 0 },
  { id: 'validate', label: 'validate', cx: 232, cy: 78, depth: 1 },
  { id: 'transform', label: 'transform', cx: 232, cy: 242, depth: 1 },
  { id: 'enrich', label: 'enrich', cx: 384, cy: 78, depth: 2 },
  { id: 'aggregate', label: 'aggregate', cx: 384, cy: 242, depth: 2 },
  { id: 'load', label: 'load', cx: 512, cy: 160, depth: 3 },
]

const EDGES: [string, string][] = [
  ['ingest', 'validate'],
  ['ingest', 'transform'],
  ['validate', 'enrich'],
  ['transform', 'aggregate'],
  ['transform', 'enrich'],
  ['enrich', 'load'],
  ['aggregate', 'load'],
]

const MAX_DEPTH = 3
const TICKS = MAX_DEPTH + 2
const HALF_W = 56
const HALF_H = 22

const byId = (id: string) => NODES.find((n) => n.id === id)!

type State = 'idle' | 'queued' | 'running' | 'success'

const NODE_FILL: Record<State, string> = {
  idle: 'var(--color-paper-raised)',
  queued: 'color-mix(in oklab, var(--color-yellow) 20%, white)',
  running: 'color-mix(in oklab, var(--color-blue) 20%, white)',
  success: 'color-mix(in oklab, var(--color-green) 20%, white)',
}
const DOT: Record<State, string> = {
  idle: 'var(--color-ink-faint)',
  queued: 'var(--color-yellow)',
  running: 'var(--color-blue)',
  success: 'var(--color-green)',
}

/** A curved connector from the right edge of a to the left edge of b. */
function edgePath(a: NodeDef, b: NodeDef): string {
  const x1 = a.cx + HALF_W
  const y1 = a.cy
  const x2 = b.cx - HALF_W
  const y2 = b.cy
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

export function DagScene() {
  const reduce = useReducedMotion()
  const [t, setT] = useState(reduce ? TICKS : -1)

  useEffect(() => {
    if (reduce) return
    let tick = -1
    const id = window.setInterval(() => {
      tick = tick > TICKS ? -1 : tick + 1
      setT(tick)
    }, 820)
    return () => window.clearInterval(id)
  }, [reduce])

  const stateOf = (depth: number): State => {
    if (reduce) return 'success'
    if (t > depth) return 'success'
    if (t === depth) return 'running'
    if (t === depth - 1) return 'queued'
    return 'idle'
  }

  const done = NODES.filter((n) => stateOf(n.depth) === 'success').length

  return (
    <figure
      className="card-pop overflow-hidden bg-paper-raised"
      aria-label="An illustration of an Airflow task graph running to completion"
    >
      <figcaption className="flex items-center gap-2.5 border-b-2 border-line-strong px-4 py-2.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-green" />
        <span className="t-label text-ink">example_dag</span>
        <span className="t-label ml-auto tabular-nums">
          {done}/{NODES.length} tasks · illustrative
        </span>
      </figcaption>

      <svg viewBox="0 0 596 320" role="img" aria-hidden="true" className="block w-full">
        <defs>
          {/* Canvas wash: a soft diagonal tint so it isn't a flat rectangle. */}
          <linearGradient id="dag-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-paper)" />
            <stop offset="1" stopColor="color-mix(in oklab, var(--color-blue) 7%, var(--color-paper))" />
          </linearGradient>
          {/* Dotted grid, like the Airflow graph canvas. */}
          <pattern id="dag-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="1.4" fill="var(--color-ink)" opacity="0.06" />
          </pattern>
          {/* Soft glow for the running node. */}
          <filter id="dag-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="596" height="320" fill="url(#dag-bg)" />
        <rect x="0" y="0" width="596" height="320" fill="url(#dag-grid)" />

        {/* Edges: curved, under the nodes. */}
        {EDGES.map(([from, to]) => {
          const a = byId(from)
          const b = byId(to)
          const carried = stateOf(a.depth) === 'success'
          const flowing = !reduce && carried && stateOf(b.depth) !== 'success'
          const d = edgePath(a, b)
          return (
            <g key={`${from}-${to}`}>
              <path
                d={d}
                fill="none"
                stroke={carried ? 'var(--color-green)' : 'var(--color-ink)'}
                strokeOpacity={carried ? 0.9 : 0.18}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {flowing && (
                <path
                  d={d}
                  fill="none"
                  stroke="var(--color-green)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="dag-flow"
                />
              )}
            </g>
          )
        })}

        {/* Nodes. */}
        {NODES.map((n) => {
          const s = stateOf(n.depth)
          const running = s === 'running' && !reduce
          return (
            <g key={n.id} filter={running ? 'url(#dag-glow)' : undefined}>
              {/* Drop block for a hint of depth (offset dark rect behind). */}
              <rect
                x={n.cx - HALF_W + 3}
                y={n.cy - HALF_H + 4}
                width={HALF_W * 2}
                height={HALF_H * 2}
                rx={12}
                fill="var(--color-ink)"
                opacity={0.9}
              />
              <rect
                x={n.cx - HALF_W}
                y={n.cy - HALF_H}
                width={HALF_W * 2}
                height={HALF_H * 2}
                rx={12}
                fill={NODE_FILL[s]}
                stroke="var(--color-ink)"
                strokeWidth={2}
              />
              {/* Status dot, with a soft ring while running. */}
              {running && (
                <circle cx={n.cx - HALF_W + 16} cy={n.cy} r={8} fill={DOT[s]} opacity={0.28}>
                  <animate attributeName="r" values="5;10;5" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0;0.35" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={n.cx - HALF_W + 16} cy={n.cy} r={4.5} fill={DOT[s]} />
              <text
                x={n.cx + 8}
                y={n.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="var(--font-mono)"
                fontSize="12.5"
                fontWeight="500"
                fill="var(--color-ink)"
              >
                {n.label}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
