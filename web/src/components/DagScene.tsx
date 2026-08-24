import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * DagScene: an animated Airflow-style task graph, the hero's centrepiece.
 *
 * Sushrut orchestrates thousands of Airflow DAGs, so the beautiful thing to look
 * at is his actual job, drawn as Airflow's graph view, and it tells a small
 * story on a loop: tasks queue and run, ONE fails and retries (which is the
 * whole job, "make a dependency graph fail loudly at the right step"), then
 * recovers and the DAG goes green. Data flows as particles travelling the curved
 * edges; running tasks glow and spin; completing tasks pop.
 *
 * All SVG: a scripted state machine for the node states, SMIL animateMotion for
 * the edge particles (they loop on their own, no per-frame JS), CSS for pops.
 * No 3D, no illustration, no AI art. Honest: header says "illustrative" and the
 * only number is the live task count. Reduced motion renders the finished graph.
 */

type NodeDef = { id: string; label: string; cx: number; cy: number }
type State = 'idle' | 'queued' | 'running' | 'retry' | 'success'

const NODES: NodeDef[] = [
  { id: 'ingest', label: 'ingest', cx: 84, cy: 160 },
  { id: 'validate', label: 'validate', cx: 232, cy: 78 },
  { id: 'transform', label: 'transform', cx: 232, cy: 242 },
  { id: 'enrich', label: 'enrich', cx: 384, cy: 78 },
  { id: 'aggregate', label: 'aggregate', cx: 384, cy: 242 },
  { id: 'load', label: 'load', cx: 512, cy: 160 },
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

/**
 * A hand-authored timeline. Per node: when it starts queueing, the step(s) it
 * runs, an optional fail step, and the step it settles green. `transform` fails
 * once and retries; everything downstream of it waits. Illustrative, not a real
 * scheduler, which is exactly what the caption says.
 */
type Track = { queuedFrom: number; run: number[]; fail?: number; successFrom: number }
const TRACK: Record<string, Track> = {
  ingest: { queuedFrom: 0, run: [0], successFrom: 1 },
  validate: { queuedFrom: 0, run: [1], successFrom: 2 },
  transform: { queuedFrom: 0, run: [1, 3], fail: 2, successFrom: 4 },
  enrich: { queuedFrom: 2, run: [4], successFrom: 5 },
  aggregate: { queuedFrom: 3, run: [4], successFrom: 5 },
  load: { queuedFrom: 5, run: [6], successFrom: 7 },
}
const LAST_STEP = 8 // 7 = all green + banner, 8 = hold, then loop

const HALF_W = 56
const HALF_H = 22
const byId = (id: string) => NODES.find((n) => n.id === id)!

const NODE_FILL: Record<State, string> = {
  idle: 'var(--color-paper-raised)',
  queued: 'color-mix(in oklab, var(--color-yellow) 22%, white)',
  running: 'color-mix(in oklab, var(--color-blue) 20%, white)',
  retry: 'color-mix(in oklab, var(--color-red) 22%, white)',
  success: 'color-mix(in oklab, var(--color-green) 20%, white)',
}
const DOT: Record<State, string> = {
  idle: 'var(--color-ink-faint)',
  queued: 'var(--color-yellow)',
  running: 'var(--color-blue)',
  retry: 'var(--color-red)',
  success: 'var(--color-green)',
}

function edgePath(a: NodeDef, b: NodeDef): string {
  const x1 = a.cx + HALF_W
  const y1 = a.cy
  const x2 = b.cx - HALF_W
  const y2 = b.cy
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

function stateOf(id: string, step: number, reduce: boolean): State {
  if (reduce) return 'success'
  const t = TRACK[id]
  if (step >= t.successFrom) return 'success'
  if (t.fail === step) return 'retry'
  if (t.run.includes(step)) return 'running'
  if (step >= t.queuedFrom) return 'queued'
  return 'idle'
}

export function DagScene() {
  const reduce = useReducedMotion() ?? false
  const [step, setStep] = useState(reduce ? LAST_STEP : 0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setStep((s) => (s >= LAST_STEP ? 0 : s + 1))
    }, 780)
    return () => window.clearInterval(id)
  }, [reduce])

  const done = NODES.filter((n) => stateOf(n.id, step, reduce) === 'success').length
  const complete = done === NODES.length

  return (
    <figure
      className="card-pop overflow-hidden bg-paper-raised"
      aria-label="An illustration of an Airflow task graph running, failing, retrying and completing"
    >
      <figcaption className="flex items-center gap-2.5 border-b-2 border-line-strong px-4 py-2.5">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full transition-colors"
          style={{ backgroundColor: complete ? 'var(--color-green)' : 'var(--color-blue)' }}
        />
        <span className="t-label text-ink">example_dag</span>
        <span className="t-label ml-auto tabular-nums">
          {done}/{NODES.length} tasks · illustrative
        </span>
      </figcaption>

      <svg viewBox="0 0 596 320" role="img" aria-hidden="true" className="block w-full">
        <defs>
          <linearGradient id="dag-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-paper)" />
            <stop
              offset="1"
              stopColor="color-mix(in oklab, var(--color-blue) 8%, var(--color-paper))"
            />
          </linearGradient>
          <pattern id="dag-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="1.4" fill="var(--color-ink)" opacity="0.06" />
          </pattern>
          <filter id="dag-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Edge paths, defined once so both the visible stroke and the moving
              particles can reference them by id via <mpath>. */}
          {EDGES.map(([from, to]) => (
            <path key={`p-${from}-${to}`} id={`dag-edge-${from}-${to}`} d={edgePath(byId(from), byId(to))} />
          ))}
        </defs>

        <rect x="0" y="0" width="596" height="320" fill="url(#dag-bg)" />
        <rect x="0" y="0" width="596" height="320" fill="url(#dag-grid)" />

        {/* Edges + travelling particles. */}
        {EDGES.map(([from, to]) => {
          const carried = stateOf(from, step, reduce) === 'success'
          const href = `#dag-edge-${from}-${to}`
          return (
            <g key={`${from}-${to}`}>
              <use
                href={href}
                fill="none"
                stroke={carried ? 'var(--color-green)' : 'var(--color-ink)'}
                strokeOpacity={carried ? 0.85 : 0.16}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {carried && !reduce &&
                [0, 0.55].map((begin) => (
                  <circle key={begin} r={3.5} fill="var(--color-green)">
                    <animateMotion dur="1.1s" begin={`${begin}s`} repeatCount="indefinite">
                      <mpath href={href} />
                    </animateMotion>
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      keyTimes="0;0.15;0.85;1"
                      dur="1.1s"
                      begin={`${begin}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
            </g>
          )
        })}

        {/* Nodes. */}
        {NODES.map((n) => {
          const s = stateOf(n.id, step, reduce)
          const running = s === 'running' && !reduce
          const retry = s === 'retry' && !reduce
          const dotX = n.cx - HALF_W + 16
          return (
            <g
              key={n.id}
              filter={running ? 'url(#dag-glow)' : undefined}
              className={retry ? 'dag-shake' : undefined}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              {/* Offset drop-block for depth. */}
              <rect
                x={n.cx - HALF_W + 3}
                y={n.cy - HALF_H + 4}
                width={HALF_W * 2}
                height={HALF_H * 2}
                rx={12}
                fill="var(--color-ink)"
                opacity={0.9}
              />
              {/* The node face; key on state so the pop animation replays on
                  each transition. */}
              <rect
                key={s}
                x={n.cx - HALF_W}
                y={n.cy - HALF_H}
                width={HALF_W * 2}
                height={HALF_H * 2}
                rx={12}
                fill={NODE_FILL[s]}
                stroke="var(--color-ink)"
                strokeWidth={2}
                className={!reduce && (s === 'success' || s === 'running') ? 'dag-pop' : undefined}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />

              {/* Status indicator: spinner while running, dot otherwise. */}
              {running ? (
                <g>
                  <circle
                    cx={dotX}
                    cy={n.cy}
                    r={6}
                    fill="none"
                    stroke="var(--color-blue)"
                    strokeOpacity={0.25}
                    strokeWidth={2.5}
                  />
                  <path
                    d={`M ${dotX} ${n.cy - 6} A 6 6 0 0 1 ${dotX + 6} ${n.cy}`}
                    fill="none"
                    stroke="var(--color-blue)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${dotX} ${n.cy}`}
                      to={`360 ${dotX} ${n.cy}`}
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              ) : (
                <circle cx={dotX} cy={n.cy} r={4.5} fill={DOT[s]} />
              )}

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

              {/* Retry tag, so the fail beat reads as a retry, not a break. */}
              {retry && (
                <text
                  x={n.cx + HALF_W - 6}
                  y={n.cy - HALF_H - 6}
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--color-red)"
                >
                  retry 1/2
                </text>
              )}
            </g>
          )
        })}

        {/* Completion banner. */}
        {complete && !reduce && (
          <g className="dag-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <rect
              x={214}
              y={288}
              width={168}
              height={24}
              rx={12}
              fill="color-mix(in oklab, var(--color-green) 20%, white)"
              stroke="var(--color-ink)"
              strokeWidth={2}
            />
            <text
              x={298}
              y={300}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-mono)"
              fontSize="11"
              fontWeight="600"
              fill="var(--color-ink)"
            >
              ✓ dag run succeeded
            </text>
          </g>
        )}
      </svg>
    </figure>
  )
}
